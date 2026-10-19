CREATE TYPE public.app_role AS ENUM ('owner');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_own_roles ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE FUNCTION public.assign_verified_portfolio_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN IF lower(NEW.email) = 'olifman787@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'owner') ON CONFLICT DO NOTHING; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.assign_verified_portfolio_owner() FROM PUBLIC;
CREATE TRIGGER portfolio_owner_on_verified_email AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_verified_portfolio_owner();
CREATE TABLE public.portfolio_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL DEFAULT auth.uid(), name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100), description text NOT NULL DEFAULT '' CHECK(char_length(description) <= 1000), technologies text[] NOT NULL DEFAULT '{}', category text NOT NULL DEFAULT '' CHECK(char_length(category) <= 80), demo_url text NOT NULL DEFAULT '' CHECK(demo_url = '' OR demo_url ~ '^https?://'), github_url text NOT NULL DEFAULT '' CHECK(github_url = '' OR github_url ~ '^https://github\.com/'), screenshot_path text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft','Published')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
 CONSTRAINT published_complete CHECK(status = 'Draft' OR (description <> '' AND screenshot_path <> '' AND published_at IS NOT NULL)),
 CONSTRAINT screenshot_owned CHECK(screenshot_path = '' OR screenshot_path LIKE owner_id::text || '/%')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT ALL ON public.portfolio_projects TO service_role;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_published ON public.portfolio_projects FOR SELECT TO anon, authenticated USING(status = 'Published');
CREATE POLICY owner_read_projects ON public.portfolio_projects FOR SELECT TO authenticated USING(owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY owner_insert_projects ON public.portfolio_projects FOR INSERT TO authenticated WITH CHECK(owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY owner_update_projects ON public.portfolio_projects FOR UPDATE TO authenticated USING(owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner')) WITH CHECK(owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY owner_delete_projects ON public.portfolio_projects FOR DELETE TO authenticated USING(owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner'));
CREATE INDEX portfolio_published_order ON public.portfolio_projects(published_at) WHERE status = 'Published';
CREATE FUNCTION public.touch_portfolio_project() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at := now(); IF TG_OP = 'INSERT' THEN NEW.status := 'Draft'; NEW.published_at := NULL; END IF; RETURN NEW; END $$;
CREATE TRIGGER touch_portfolio_project BEFORE INSERT OR UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.touch_portfolio_project();
CREATE POLICY owner_screenshot_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id = 'project-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY owner_screenshot_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id = 'project-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text AND public.has_role(auth.uid(), 'owner') AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp'));
CREATE POLICY owner_screenshot_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id = 'project-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY published_screenshot_read ON storage.objects FOR SELECT TO anon, authenticated USING(bucket_id = 'project-screenshots' AND EXISTS(SELECT 1 FROM public.portfolio_projects p WHERE p.screenshot_path = name AND p.status = 'Published'));