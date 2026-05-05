CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: conversation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    intent_type text,
    related_decision_ids uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT conversation_logs_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text,
    domain text NOT NULL,
    intent_primary text NOT NULL,
    intent_secondary text[],
    intent_time_horizon text,
    constraints_time text,
    constraints_financial text,
    constraints_emotional text,
    constraints_risk_tolerance text,
    constraints_other text[],
    alternatives jsonb DEFAULT '[]'::jsonb,
    reasoning text[] DEFAULT '{}'::text[],
    final_choice text NOT NULL,
    confidence integer NOT NULL,
    visibility text DEFAULT 'private'::text NOT NULL,
    reflection text,
    outcome text,
    linked_decisions uuid[],
    last_recalled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT decisions_confidence_check CHECK (((confidence >= 0) AND (confidence <= 100))),
    CONSTRAINT decisions_constraints_risk_tolerance_check CHECK ((constraints_risk_tolerance = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT decisions_domain_check CHECK ((domain = ANY (ARRAY['career'::text, 'financial'::text, 'personal'::text, 'health'::text, 'relationships'::text, 'other'::text]))),
    CONSTRAINT decisions_visibility_check CHECK ((visibility = ANY (ARRAY['private'::text, 'selective'::text, 'shared'::text])))
);


--
-- Name: conversation_logs conversation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_logs
    ADD CONSTRAINT conversation_logs_pkey PRIMARY KEY (id);


--
-- Name: decisions decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_pkey PRIMARY KEY (id);


--
-- Name: decisions update_decisions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: conversation_logs conversation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_logs
    ADD CONSTRAINT conversation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: decisions decisions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: decisions Anyone can view shared decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view shared decisions" ON public.decisions FOR SELECT USING ((visibility = 'shared'::text));


--
-- Name: decisions Users can create their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own decisions" ON public.decisions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: conversation_logs Users can create their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own logs" ON public.conversation_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: decisions Users can delete their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own decisions" ON public.decisions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: decisions Users can update their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own decisions" ON public.decisions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: decisions Users can view their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own decisions" ON public.decisions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversation_logs Users can view their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own logs" ON public.conversation_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversation_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: decisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;