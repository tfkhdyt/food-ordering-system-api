SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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

-- *not* creating schema, since initdb creates it


--
-- Name: account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_status AS ENUM (
    'unverified',
    'verified',
    'inactive'
);


--
-- Name: menu_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.menu_status AS ENUM (
    'available',
    'out_of_stock'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    first_name character varying(25) NOT NULL,
    middle_name character varying(25),
    last_name character varying(25),
    email character varying(50) NOT NULL,
    phone_number character varying(15) NOT NULL,
    address text NOT NULL,
    profile_image text,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    account_status public.account_status DEFAULT 'unverified'::public.account_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id bytea NOT NULL
);


--
-- Name: menu_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_types (
    name character varying(100) NOT NULL,
    description text,
    id bytea NOT NULL
);


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    id bytea NOT NULL,
    name character varying(255) NOT NULL,
    price real NOT NULL,
    type_id bytea NOT NULL,
    image character varying(100),
    ingredients text,
    status public.menu_status DEFAULT 'available'::public.menu_status NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: site_informations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_informations (
    name character varying(50) NOT NULL,
    description text,
    contact_info character varying(50) NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bytea NOT NULL,
    id bytea NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    full_name character varying(100) NOT NULL,
    contact character varying(25),
    email character varying(100) NOT NULL,
    username character varying(25) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id bytea NOT NULL
);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_number_key UNIQUE (phone_number);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_username_key UNIQUE (username);


--
-- Name: menu_types menu_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_types
    ADD CONSTRAINT menu_types_name_key UNIQUE (name);


--
-- Name: menu_types menu_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_types
    ADD CONSTRAINT menu_types_pkey PRIMARY KEY (id);


--
-- Name: menus menus_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_name_key UNIQUE (name);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: site_informations site_informations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_informations
    ADD CONSTRAINT site_informations_pkey PRIMARY KEY (id);


--
-- Name: site_informations uq_site_info_user_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_informations
    ADD CONSTRAINT uq_site_info_user_id UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: menus fk_menu_type_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT fk_menu_type_id FOREIGN KEY (type_id) REFERENCES public.menu_types(id) ON DELETE CASCADE;


--
-- Name: site_informations fk_site_info_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_informations
    ADD CONSTRAINT fk_site_info_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240331001218'),
    ('20240331102714'),
    ('20240405234210'),
    ('20240505014659'),
    ('20240518032317'),
    ('20240518034651'),
    ('20240518041446'),
    ('20240518042307'),
    ('20240518050658'),
    ('20240518231109'),
    ('20240521084327');
