--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-07-13 13:23:45

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
-- TOC entry 5 (class 2615 OID 57647)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 261 (class 1255 OID 65897)
-- Name: update_notifications_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_notifications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_notifications_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 57648)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 65795)
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    admin_id integer,
    action text NOT NULL,
    details json,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 65794)
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO postgres;

--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 240
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- TOC entry 250 (class 1259 OID 65871)
-- Name: admin_permission_overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permission_overrides (
    id text NOT NULL,
    admin_id integer NOT NULL,
    permission text NOT NULL,
    granted boolean NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_permission_overrides OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 57693)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'staff'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login timestamp without time zone,
    token text,
    avatar_url text,
    ip_address text
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 65827)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id text,
    action text NOT NULL,
    resource_type text,
    resource_id text,
    details json,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 65826)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 244
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 256 (class 1259 OID 65951)
-- Name: buses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buses (
    id integer NOT NULL,
    vendorid integer NOT NULL,
    plate_number character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer DEFAULT 44 NOT NULL,
    assigned_route_id integer,
    current_location_lat numeric(10,8),
    current_location_lng numeric(11,8),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buses OWNER TO postgres;

--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE buses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.buses IS 'Buses owned by vendors for route operations';


--
-- TOC entry 255 (class 1259 OID 65950)
-- Name: buses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buses_id_seq OWNER TO postgres;

--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 255
-- Name: buses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buses_id_seq OWNED BY public.buses.id;


--
-- TOC entry 229 (class 1259 OID 57750)
-- Name: completed_trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.completed_trips (
    id integer NOT NULL,
    route_id integer NOT NULL,
    vendor_id integer NOT NULL,
    departure text NOT NULL,
    destination text NOT NULL,
    departure_time timestamp without time zone NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    passenger_count integer NOT NULL,
    revenue numeric NOT NULL,
    rating numeric,
    completed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.completed_trips OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 57749)
-- Name: completed_trips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.completed_trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.completed_trips_id_seq OWNER TO postgres;

--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 228
-- Name: completed_trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.completed_trips_id_seq OWNED BY public.completed_trips.id;


--
-- TOC entry 254 (class 1259 OID 65937)
-- Name: customer_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(20) DEFAULT 'info'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone
);


ALTER TABLE public.customer_notifications OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 65936)
-- Name: customer_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 253
-- Name: customer_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_notifications_id_seq OWNED BY public.customer_notifications.id;


--
-- TOC entry 249 (class 1259 OID 65853)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    mobile character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    avatar_url text,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 65852)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 248
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 237 (class 1259 OID 65750)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying(32) NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read_at timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 65749)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 236
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 258 (class 1259 OID 65976)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    vendorid integer NOT NULL,
    ticket_id integer,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    status character varying(20) DEFAULT 'completed'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reference character varying(100),
    customer_email character varying(255),
    customer_name character varying(255)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 65975)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 257
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 239 (class 1259 OID 65766)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    emergency_contact character varying(50),
    notification_pref character varying(20) DEFAULT 'email'::character varying,
    profile_picture text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 65765)
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 238
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- TOC entry 247 (class 1259 OID 65843)
-- Name: read_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.read_notifications (
    id integer NOT NULL,
    user_id text NOT NULL,
    notification_id character varying(50) NOT NULL,
    read_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.read_notifications OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 65842)
-- Name: read_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.read_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.read_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 246
-- Name: read_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.read_notifications_id_seq OWNED BY public.read_notifications.id;


--
-- TOC entry 235 (class 1259 OID 57790)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    route_id integer NOT NULL,
    vendor_id integer NOT NULL,
    ticket_id integer NOT NULL,
    rating integer NOT NULL,
    review text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    comment text
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 57789)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 234
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 233 (class 1259 OID 57772)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    permissions text[] NOT NULL,
    color text DEFAULT 'bg-blue-500'::text NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_by_admin_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 57771)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 232
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 221 (class 1259 OID 57673)
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routes (
    id integer NOT NULL,
    vendorid integer NOT NULL,
    departure character varying(255) NOT NULL,
    destination character varying(255) NOT NULL,
    estimatedarrival timestamp without time zone,
    fare integer NOT NULL,
    capacity integer DEFAULT 44 NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    daysofweek text[] NOT NULL,
    kilometers integer NOT NULL,
    stops text[] NOT NULL,
    createdat timestamp without time zone DEFAULT now() NOT NULL,
    updatedat timestamp without time zone DEFAULT now() NOT NULL,
    departuretime time without time zone
);


ALTER TABLE public.routes OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 57672)
-- Name: routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.routes_id_seq OWNER TO postgres;

--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 220
-- Name: routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.routes_id_seq OWNED BY public.routes.id;


--
-- TOC entry 231 (class 1259 OID 57760)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    name text NOT NULL,
    value text,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 57759)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 230
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 227 (class 1259 OID 57730)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    route_id integer NOT NULL,
    vendorid integer NOT NULL,
    booking_reference text,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    seat_number integer NOT NULL,
    amount numeric NOT NULL,
    status text NOT NULL,
    travel_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    is_walk_in boolean DEFAULT false,
    user_id integer
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 57729)
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO postgres;

--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 226
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- TOC entry 260 (class 1259 OID 66002)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    firebase_uid character varying(128),
    email character varying(255),
    name character varying(255),
    photo_url text,
    phone character varying(32),
    provider character varying(64),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password text,
    mobile character varying(32),
    username character varying(64),
    password_hash character varying(128)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 57692)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.admins.id;


--
-- TOC entry 259 (class 1259 OID 66001)
-- Name: users_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq1 OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 259
-- Name: users_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq1 OWNED BY public.users.id;


--
-- TOC entry 252 (class 1259 OID 65925)
-- Name: vendor_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(20) DEFAULT 'info'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone
);


ALTER TABLE public.vendor_notifications OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 65924)
-- Name: vendor_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 251
-- Name: vendor_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_notifications_id_seq OWNED BY public.vendor_notifications.id;


--
-- TOC entry 243 (class 1259 OID 65805)
-- Name: vendor_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_user_permissions (
    id integer NOT NULL,
    vendor_user_id integer NOT NULL,
    permission text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    granted_by integer,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vendor_user_permissions OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 65804)
-- Name: vendor_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_user_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 242
-- Name: vendor_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_user_permissions_id_seq OWNED BY public.vendor_user_permissions.id;


--
-- TOC entry 225 (class 1259 OID 57708)
-- Name: vendor_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_users (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'operator'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login timestamp without time zone,
    token text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text
);


ALTER TABLE public.vendor_users OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 57707)
-- Name: vendor_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_users_id_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 224
-- Name: vendor_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_users_id_seq OWNED BY public.vendor_users.id;


--
-- TOC entry 219 (class 1259 OID 57659)
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    createdat timestamp without time zone DEFAULT now(),
    updatedat timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    ip_address text,
    password text,
    permissions text[],
    logo text
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN vendors.logo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.logo IS 'URL or path to the vendor logo image';


--
-- TOC entry 218 (class 1259 OID 57658)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO postgres;

--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 218
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 4893 (class 2604 OID 65798)
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 57696)
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 65830)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 65954)
-- Name: buses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buses ALTER COLUMN id SET DEFAULT nextval('public.buses_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 57753)
-- Name: completed_trips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.completed_trips ALTER COLUMN id SET DEFAULT nextval('public.completed_trips_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 65940)
-- Name: customer_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_notifications ALTER COLUMN id SET DEFAULT nextval('public.customer_notifications_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 65856)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 65753)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 65979)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 65769)
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 65846)
-- Name: read_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.read_notifications ALTER COLUMN id SET DEFAULT nextval('public.read_notifications_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 57793)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 57775)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 57676)
-- Name: routes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes ALTER COLUMN id SET DEFAULT nextval('public.routes_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 57763)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 57733)
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 66005)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq1'::regclass);


--
-- TOC entry 4908 (class 2604 OID 65928)
-- Name: vendor_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_notifications ALTER COLUMN id SET DEFAULT nextval('public.vendor_notifications_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 65808)
-- Name: vendor_user_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.vendor_user_permissions_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 57711)
-- Name: vendor_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_users ALTER COLUMN id SET DEFAULT nextval('public.vendor_users_id_seq'::regclass);


--
-- TOC entry 4853 (class 2604 OID 57662)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 5173 (class 0 OID 57648)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- TOC entry 5197 (class 0 OID 65795)
-- Dependencies: 241
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, admin_id, action, details, "timestamp") FROM stdin;
1	2	Session created	{"sessionId":"4hy87nvgzdnzin7d6xqcil","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:24:15.086Z"}	2025-07-02 05:24:15.088548
2	2	Session created	{"sessionId":"fvl3y5km8mlnp32nji1wta","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:31:58.547Z"}	2025-07-02 05:31:58.549853
3	2	Session created	{"sessionId":"3k9axr0qt6lzovr66xzone","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:35:20.982Z"}	2025-07-02 05:35:20.985529
4	2	Session created	{"sessionId":"wbs322ke2kid78ko5xtvml","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:36:49.826Z"}	2025-07-02 05:36:49.829861
5	2	Session created	{"sessionId":"o5yb8jclj9cvk1umbzc73i","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:43:20.515Z"}	2025-07-02 05:43:20.516733
6	2	Session created	{"sessionId":"b2duhg6vtywh55ei5o4yf","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:49:27.105Z"}	2025-07-02 05:49:27.10909
7	2	Session created	{"sessionId":"tnsf7pcgy5nqa9nto5ssw","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:51:49.594Z"}	2025-07-02 05:51:49.595892
8	2	Session created	{"sessionId":"75mx5liy0heq8ub9nz0eyl","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:55:35.979Z"}	2025-07-02 05:55:35.986348
9	2	Session created	{"sessionId":"em1vjbboag8cnvre3naqfw","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T02:56:09.865Z"}	2025-07-02 05:56:09.87218
10	2	Session created	{"sessionId":"k6umsrwz10ecyd98o7n5b","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T03:02:33.386Z"}	2025-07-02 06:02:33.39008
11	2	Session created	{"sessionId":"ysl1rml8cqkbfmja41bp7v","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36","timestamp":"2025-07-02T03:02:56.730Z"}	2025-07-02 06:02:56.733343
12	2	Session created	{"sessionId":"1ulwgpnw1b9bj4qkglwi6u","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-02T21:50:42.989Z"}	2025-07-03 00:50:42.990581
13	2	Session created	{"sessionId":"4cyucay0rs5byxzjayv16f","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-02T22:11:11.386Z"}	2025-07-03 01:11:11.387749
14	2	Session created	{"sessionId":"76vjcbe12gw62rspu8et5m","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-02T23:51:14.274Z"}	2025-07-03 02:51:14.277258
15	2	Session created	{"sessionId":"taamg6obfth1v0uyo89qin","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-02T23:51:26.348Z"}	2025-07-03 02:51:26.350549
16	2	Session ended	{"sessionId":"taamg6obfth1v0uyo89qin","timestamp":"2025-07-03T00:40:41.769Z"}	2025-07-03 03:40:41.771296
17	2	Session created	{"sessionId":"0sii7s1b717ouian3cgf0d","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-03T00:40:49.801Z"}	2025-07-03 03:40:49.803245
18	2	Session created	{"sessionId":"qirdt3freajth7t8dpsvg","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-03T00:41:04.551Z"}	2025-07-03 03:41:04.552388
19	2	Session ended	{"sessionId":"qirdt3freajth7t8dpsvg","timestamp":"2025-07-03T00:46:36.379Z"}	2025-07-03 03:46:36.379969
20	2	Session created	{"sessionId":"b5a8eu7gadln6al6infzgc","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-03T00:46:48.488Z"}	2025-07-03 03:46:48.490242
21	2	Session created	{"sessionId":"6aoli6kb0qh96vp7qdr8sw","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-03T00:46:57.086Z"}	2025-07-03 03:46:57.088034
22	2	Session ended	{"sessionId":"6aoli6kb0qh96vp7qdr8sw","timestamp":"2025-07-03T00:50:13.767Z"}	2025-07-03 03:50:13.768429
23	2	Session created	{"sessionId":"n2eb68d677buvbiwawiyu","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-03T00:50:23.862Z"}	2025-07-03 03:50:23.863537
24	2	Session created	{"sessionId":"jntqu9gg8zo8m70b018qpj","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T00:51:10.027Z"}	2025-07-03 03:51:10.028746
25	2	Session created	{"sessionId":"fgxonoodtdd44f47kyfg78","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T00:51:24.146Z"}	2025-07-03 03:51:24.154567
26	2	Session created	{"sessionId":"qdi3dbkymacnernbm08phk","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T12:37:49.164Z"}	2025-07-03 15:37:49.173486
27	2	Session ended	{"sessionId":"qdi3dbkymacnernbm08phk","timestamp":"2025-07-03T12:49:11.725Z"}	2025-07-03 15:49:11.7268
28	\N	Session created	{"sessionId":"rbruqfs11inqlvgmss0vh","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T21:37:54.637Z"}	2025-07-04 00:37:54.638779
29	\N	Session created	{"sessionId":"zmomfqs1com25tf5kuwc9","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T21:37:59.035Z"}	2025-07-04 00:37:59.036142
30	\N	Session ended	{"sessionId":"zmomfqs1com25tf5kuwc9","timestamp":"2025-07-03T21:50:29.726Z"}	2025-07-04 00:50:29.726981
31	\N	Session created	{"sessionId":"0ao18qpie3dpg6n1pfvdnnc","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T21:51:29.599Z"}	2025-07-04 00:51:29.600273
32	\N	Session created	{"sessionId":"me7jug8xoysxu2opsxqu2h","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T21:51:34.032Z"}	2025-07-04 00:51:34.03356
33	\N	Session created	{"sessionId":"8nqj53gdpr2erez3k458j","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T21:59:40.596Z"}	2025-07-04 00:59:40.597141
34	\N	Session ended	{"sessionId":"8nqj53gdpr2erez3k458j","timestamp":"2025-07-03T22:04:31.729Z"}	2025-07-04 01:04:31.730602
35	\N	Session created	{"sessionId":"2f2seyvpwzlluih8r21kka","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:04:33.480Z"}	2025-07-04 01:04:33.481527
36	\N	Session created	{"sessionId":"sfdhcg501dozpp9ojmdxs","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:04:34.690Z"}	2025-07-04 01:04:34.691348
37	\N	Session ended	{"sessionId":"sfdhcg501dozpp9ojmdxs","timestamp":"2025-07-03T22:12:29.481Z"}	2025-07-04 01:12:29.482423
38	\N	Session created	{"sessionId":"d4ets62u54vauskvgi46f","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:12:31.653Z"}	2025-07-04 01:12:31.654509
39	\N	Session created	{"sessionId":"9pq3o42i69s9r7flnkwt","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:12:34.628Z"}	2025-07-04 01:12:34.629814
40	\N	Session ended	{"sessionId":"9pq3o42i69s9r7flnkwt","timestamp":"2025-07-03T22:34:25.091Z"}	2025-07-04 01:34:25.092827
41	\N	Session created	{"sessionId":"8p3esqoxveicoqhrdmvyff","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:34:26.898Z"}	2025-07-04 01:34:26.89989
42	\N	Session created	{"sessionId":"lwi3dg7jxmcozzj477a3p","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-03T22:34:28.234Z"}	2025-07-04 01:34:28.235777
43	\N	Session created	{"sessionId":"7rg47z5cn62ranputdi6c","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-04T00:26:34.952Z"}	2025-07-04 03:26:34.95493
44	\N	Session ended	{"sessionId":"7rg47z5cn62ranputdi6c","timestamp":"2025-07-04T00:44:17.583Z"}	2025-07-04 03:44:17.584429
45	\N	Session created	{"sessionId":"hfhln823mw4ikipengp99","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-04T00:44:20.053Z"}	2025-07-04 03:44:20.054937
46	\N	Session created	{"sessionId":"8v28bz7l8lxntvz7phi9cc","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0","timestamp":"2025-07-04T00:44:21.354Z"}	2025-07-04 03:44:21.355893
47	\N	Session ended	{"sessionId":"8v28bz7l8lxntvz7phi9cc","timestamp":"2025-07-04T00:56:07.089Z"}	2025-07-04 03:56:07.090151
48	\N	Session created	{"sessionId":"rycqa17tn4kmp3man2s59","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T00:59:00.502Z"}	2025-07-04 03:59:00.502816
49	\N	Session created	{"sessionId":"nwqpkiekgge2ltkz3gd5qy","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T00:59:14.330Z"}	2025-07-04 03:59:14.331686
50	\N	Session created	{"sessionId":"tdsj1ahq5na5bmkm0duhf","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T01:09:21.218Z"}	2025-07-04 04:09:21.219597
51	\N	Session created	{"sessionId":"ujyc2tfkdzn5hb7ysbyi","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T01:22:44.640Z"}	2025-07-04 04:22:44.641412
52	\N	Session created	{"sessionId":"1auhcbvt9q2yo60yl6dkb","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T01:31:54.788Z"}	2025-07-04 04:31:54.789517
53	\N	Session created	{"sessionId":"7h0be50jo3re2gfkq2b8b","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T21:10:57.814Z"}	2025-07-05 00:10:57.816241
54	\N	Session created	{"sessionId":"4n8sh75nam4i3msqvoebxl","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T21:16:01.270Z"}	2025-07-05 00:16:01.273307
55	\N	Session ended	{"sessionId":"4n8sh75nam4i3msqvoebxl","timestamp":"2025-07-04T23:16:53.977Z"}	2025-07-05 02:16:53.983408
56	\N	Session created	{"sessionId":"48010h0kox4s2tpabzdbqf","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T23:20:55.968Z"}	2025-07-05 02:20:55.969514
57	\N	Session created	{"sessionId":"rs4s57bjdhovrqsmdg5me","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-04T23:21:05.028Z"}	2025-07-05 02:21:05.030341
58	\N	Session created	{"sessionId":"rmbt6cblbrn6fu0yzg7yav","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T01:21:53.622Z"}	2025-07-05 04:21:53.624345
59	\N	Session created	{"sessionId":"wdop02dyb2ahspq0v3wss","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T01:47:13.637Z"}	2025-07-05 04:47:13.63842
60	\N	Session created	{"sessionId":"ew3a5jproap5l8y9wy0lg","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T01:51:31.420Z"}	2025-07-05 04:51:31.422833
61	4	Created database backup	{"path":"C:\\\\Users\\\\Hunter\\\\Desktop\\\\Tiyende\\\\monorepo\\\\apps\\\\admin\\\\backups\\\\backup-2025-07-05T01-52-05-868Z.sql"}	2025-07-05 04:52:06.357963
62	4	Created full backup	{"path":"C:\\\\Users\\\\Hunter\\\\Desktop\\\\Tiyende\\\\monorepo\\\\apps\\\\admin\\\\backups\\\\backup-full-2025-07-05T02-19-55-048Z.sql","type":"full"}	2025-07-05 05:19:55.356476
63	4	Deleted database backup	{"filename":"backup-users-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:12.130082
64	4	Deleted database backup	{"filename":"backup-settings-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:14.801074
65	4	Deleted database backup	{"filename":"backup-operational-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:16.181945
66	4	Deleted database backup	{"filename":"backup-full-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:17.747336
67	4	Deleted database backup	{"filename":"backup-full-2025-07-05T02-19-55-048Z.sql"}	2025-07-05 05:20:18.853771
68	4	Deleted database backup	{"filename":"backup-audit-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:19.881344
69	4	Deleted database backup	{"filename":"backup-analytics-2025-07-05T05-11-09.sql"}	2025-07-05 05:20:21.125015
70	4	Deleted database backup	{"filename":"backup-2025-07-05T01-52-05-868Z.sql"}	2025-07-05 05:20:29.675942
71	4	Created full backup	{"path":"C:\\\\Users\\\\Hunter\\\\Desktop\\\\Tiyende\\\\monorepo\\\\apps\\\\admin\\\\backups\\\\backup-full-2025-07-05T02-20-34-931Z.sql","type":"full"}	2025-07-05 05:20:35.162987
72	\N	Session created	{"sessionId":"5ni3itlytvrpjyny4fds6","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T02:40:23.584Z"}	2025-07-05 05:40:23.585042
73	\N	Session created	{"sessionId":"incxc7t72srf6o9uyrcpo","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T03:40:38.188Z"}	2025-07-05 06:40:38.191229
74	\N	Session created	{"sessionId":"kcq7ccrgckmsvhtxsevus","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T22:38:44.192Z"}	2025-07-06 01:38:44.195389
75	\N	Session created	{"sessionId":"0sxecq6wb46gr9ryvv8esw","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T22:38:53.411Z"}	2025-07-06 01:38:53.412482
76	\N	Session created	{"sessionId":"q30rrrlui7kdody3ufyh","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T22:48:33.992Z"}	2025-07-06 01:48:33.994141
77	\N	Session created	{"sessionId":"yw7b548arik9h8eararg8","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-05T22:53:32.200Z"}	2025-07-06 01:53:32.202548
78	\N	Session created	{"sessionId":"u3qyygcp0fgtkqckzu419i","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-06T22:38:43.411Z"}	2025-07-07 01:38:43.412709
79	\N	Session created	{"sessionId":"ui2k1xyig6cuhatpx5oj2o","ipAddress":"::1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","timestamp":"2025-07-06T22:38:51.750Z"}	2025-07-07 01:38:51.751358
\.


--
-- TOC entry 5206 (class 0 OID 65871)
-- Dependencies: 250
-- Data for Name: admin_permission_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permission_overrides (id, admin_id, permission, granted, created_by, created_at) FROM stdin;
override_1751585690782_avuz8zf4f	2	routes_edit	t	4	2025-07-03 23:34:50.782
override_1751585693068_p5o64eoph	2	routes_create	t	4	2025-07-03 23:34:53.068
override_1751585694854_1r2izct1r	2	routes_view	t	4	2025-07-03 23:34:54.854
override_1751585695887_0nfytacbr	2	routes_delete	t	4	2025-07-03 23:34:55.887
override_1751585700694_3sz81gtzz	2	tickets_view	t	4	2025-07-03 23:35:00.694
override_1751585703739_ik8swwpl3	2	tickets_delete	t	4	2025-07-03 23:35:03.739
override_1751585706066_y6b19asrv	2	tickets_create	t	4	2025-07-03 23:35:06.067
override_1751585708154_38dbdpmb4	2	tickets_edit	t	4	2025-07-03 23:35:08.154
\.


--
-- TOC entry 5179 (class 0 OID 57693)
-- Dependencies: 223
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, username, password, email, full_name, role, active, last_login, token, avatar_url, ip_address) FROM stdin;
4	superadmin	$2b$10$67tq3TcG7AkJeFW7XXYOwOqapWAZODDpIK55fb5IOLGWcR7mnAlw.	superadmin@example.com	Super Admin	admin	t	2025-07-06 22:38:51.755	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJzdXBlcmFkbWluIiwicm9sZSI6ImFkbWluIiwic2Vzc2lvbklkIjoidWkyazF4eWlnNmN1aGF0cHg1b2oybyIsImlhdCI6MTc1MTg0MTUzMSwiZXhwIjoxNzUxOTI3OTMxfQ.-1AP3_83suOiXAiPz8M8wDN6z9n-8300p8NqhVVb4bA	\N	::1
2	admin	admin123	admin@tiyende.com	System Administrator	staff	t	\N	\N	\N	\N
\.


--
-- TOC entry 5201 (class 0 OID 65827)
-- Dependencies: 245
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) FROM stdin;
1	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-02 03:02:33.399
2	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-02 03:02:56.738
3	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-02 21:50:43.002
4	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-02 22:11:11.395
5	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-02 23:51:14.283
6	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-02 23:51:26.354
7	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-03 00:40:49.806
8	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-03 00:41:04.556
9	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-03 00:46:48.496
10	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-03 00:46:57.09
11	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-03 00:50:23.868
12	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 00:51:10.034
13	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 00:51:24.152
14	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 12:37:49.178
15	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 21:37:54.647
16	2	login	auth	2	{"success":true,"username":"admin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 21:37:59.04
17	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 21:51:29.605
18	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 21:51:34.037
19	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 21:59:40.602
20	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:04:33.486
21	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:04:34.694
22	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:12:31.664
23	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:12:34.632
24	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:34:26.902
25	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-03 22:34:28.238
26	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-04 00:26:34.962
27	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-04 00:44:20.063
28	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	2025-07-04 00:44:21.358
29	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 00:59:00.508
30	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 00:59:14.337
31	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 01:09:21.227
32	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 01:22:44.647
33	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 01:31:54.797
34	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 21:10:57.824
35	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 21:16:01.282
36	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 23:20:55.977
37	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-04 23:21:05.034
38	1	login	user	1	{"method": "web", "success": true}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 03:05:22.508339
39	1	create	route	1	{"departure": "Lusaka", "destination": "Kitwe", "fare": 150}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 02:05:22.508339
40	1	update	vendor	1	{"name": "Updated Vendor Name", "status": "active"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 01:05:22.508339
41	1	delete	ticket	1	{"ticket_id": "1", "reason": "cancelled"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 00:05:22.508339
42	1	logout	user	1	{"method": "web", "duration": "3600"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-04 23:05:22.508339
43	1	login	user	1	{"method": "web", "success": true}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 03:15:26.902723
44	1	create	route	1	{"departure": "Lusaka", "destination": "Kitwe", "fare": 150}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 02:15:26.902723
45	1	update	vendor	1	{"name": "Updated Vendor Name", "status": "active"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 01:15:26.902723
46	1	delete	ticket	1	{"ticket_id": "1", "reason": "cancelled"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-05 00:15:26.902723
47	1	logout	user	1	{"method": "web", "duration": "3600"}	192.168.1.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2025-07-04 23:15:26.902723
48	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 01:21:53.634
49	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 01:47:13.65
50	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 01:51:31.432
51	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 02:40:23.59
52	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 03:40:38.197
53	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 22:38:44.205
54	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 22:38:53.417
55	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 22:48:34
56	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-05 22:53:32.211
57	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-06 22:38:43.421
58	4	login	auth	4	{"success":true,"username":"superadmin"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-06 22:38:51.757
\.


--
-- TOC entry 5212 (class 0 OID 65951)
-- Dependencies: 256
-- Data for Name: buses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buses (id, vendorid, plate_number, name, capacity, assigned_route_id, current_location_lat, current_location_lng, status, created_at, updated_at) FROM stdin;
1	1	ABC123	Express Bus 1	44	\N	\N	\N	active	2025-07-06 03:07:40.070042	2025-07-06 03:07:40.070042
2	1	DEF456	Express Bus 2	44	\N	\N	\N	active	2025-07-06 03:07:40.070042	2025-07-06 03:07:40.070042
3	1	GHI789	Express Bus 3	44	\N	\N	\N	active	2025-07-06 03:07:40.070042	2025-07-06 03:07:40.070042
\.


--
-- TOC entry 5185 (class 0 OID 57750)
-- Dependencies: 229
-- Data for Name: completed_trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.completed_trips (id, route_id, vendor_id, departure, destination, departure_time, arrival_time, passenger_count, revenue, rating, completed_at) FROM stdin;
\.


--
-- TOC entry 5210 (class 0 OID 65937)
-- Dependencies: 254
-- Data for Name: customer_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_notifications (id, user_id, type, title, message, status, created_at, read_at) FROM stdin;
1	1	info	Booking Confirmed	Your booking has been confirmed	unread	2025-07-05 06:59:27.676922	\N
2	1	success	Payment Received	Payment processed successfully	read	2025-07-05 06:59:27.676922	\N
3	2	info	Route Update	Your route has been updated	unread	2025-07-05 06:59:27.676922	\N
\.


--
-- TOC entry 5205 (class 0 OID 65853)
-- Dependencies: 249
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, mobile, name, email, avatar_url, is_active, last_login, created_at, updated_at) FROM stdin;
1	260000000001	popo	popo@gmail.com	\N	t	2025-07-07 05:15:20.641719	2025-07-03 15:40:30.46507	2025-07-03 15:40:30.46507
2	260977123456	Test User	\N	\N	t	2025-07-08 03:27:24.834094	2025-07-08 03:25:49.122686	2025-07-08 03:25:49.122686
3	0978654321	James	\N	\N	t	2025-07-10 10:45:41.652279	2025-07-10 10:45:41.649606	2025-07-10 10:45:41.649606
\.


--
-- TOC entry 5193 (class 0 OID 65750)
-- Dependencies: 237
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, status, created_at, read_at, updated_at) FROM stdin;
26		booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 08/07/2025 at Unknown is confirmed.	unread	2025-07-08 03:33:45.279618	\N	2025-07-08 05:15:44.025118
27		payment	Payment Received	Your payment for ticket TKT49N0YB1W8 on 08/07/2025 at Unknown was successful.	unread	2025-07-08 03:33:45.281445	\N	2025-07-08 05:15:44.025118
1	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on Tue Jul 01 2025 00:00:00 GMT+0300 (Eastern European Summer Time) is confirmed.	read	2025-06-30 14:55:45.594141	2025-07-03 02:42:39.486857	2025-07-08 05:15:44.025118
2	260000000000	payment	Payment Received	Your payment for ticket TKT38WRTYLIF was successful.	read	2025-06-30 14:55:45.595368	2025-07-03 02:42:40.197559	2025-07-08 05:15:44.025118
3	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on Tue Jul 01 2025 00:00:00 GMT+0300 (Eastern European Summer Time) is confirmed.	read	2025-06-30 14:59:14.061218	2025-07-03 02:42:40.999184	2025-07-08 05:15:44.025118
15	1	promo	Trial	Free Food For All	read	2025-07-03 01:11:53.827523	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
16	1	info	Trial	Trial 123	read	2025-07-03 01:32:51.838901	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
17	1	promo	Free	Free food for all	read	2025-07-03 01:45:21.968658	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
18	1	promo	Free food	Free food for all	read	2025-07-03 01:46:14.851582	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
4	260000000000	payment	Payment Received	Your payment for ticket TKT09894NFJF was successful.	read	2025-06-30 14:59:14.062374	2025-07-03 02:42:41.67236	2025-07-08 05:15:44.025118
21	1	reminder	System Maintenance	Scheduled maintenance will occur tonight at 2 AM. Services may be temporarily unavailable.	read	2025-07-05 05:37:54.925756	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
22	1	info	Greeting	Hello Everyone	read	2025-07-05 05:40:59.422945	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
23	1	info	Hi	Hello	read	2025-07-05 05:55:02.102504	2025-07-08 05:22:44.834939	2025-07-08 05:22:44.834939
5	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on Tue Jul 01 2025 00:00:00 GMT+0300 (Eastern European Summer Time) is confirmed.	read	2025-06-30 15:29:46.452178	2025-07-03 02:42:42.32344	2025-07-08 05:15:44.025118
14	260000000000	payment	Payment Received	Your payment for ticket TKTP9OS3SVPK on 01/07/2025 at 10:00 was successful.	read	2025-07-02 01:13:06.640866	2025-07-03 02:49:59.016488	2025-07-08 05:15:44.025118
13	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 01/07/2025 at 10:00 is confirmed.	read	2025-07-02 01:13:06.638962	2025-07-03 02:50:00.000302	2025-07-08 05:15:44.025118
6	260000000000	payment	Payment Received	Your payment for ticket TKTSWTXPJHP8 was successful.	read	2025-06-30 15:29:46.453275	2025-07-03 02:42:43.920619	2025-07-08 05:15:44.025118
31	lytoneterro123@gmail.com	payment	Payment Received	Your payment for ticket TKT7ERV054P9 on 08/07/2025 at Unknown was successful.	read	2025-07-08 03:48:59.101011	2025-07-08 05:41:46.593399	2025-07-08 05:41:46.593399
7	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 01/07/2025 at 00:00 is confirmed.	read	2025-06-30 15:31:10.772126	2025-07-03 02:42:44.783675	2025-07-08 05:15:44.025118
29	lytoneterro123@gmail.com	payment	Payment Received	Your payment for ticket TKTE9AIMZM6O on 08/07/2025 at Unknown was successful.	read	2025-07-08 03:41:35.785317	2025-07-08 05:33:59.108082	2025-07-08 05:33:59.108082
12	260000000000	payment	Payment Received	Your payment for ticket TKT86TVJ4KO0 on 01/07/2025 at 10:00 was successful.	read	2025-06-30 23:07:41.333027	2025-07-03 02:50:04.135665	2025-07-08 05:15:44.025118
28	lytoneterro123@gmail.com	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 08/07/2025 at Unknown is confirmed.	read	2025-07-08 03:41:35.784381	2025-07-08 05:33:59.873225	2025-07-08 05:33:59.873225
8	260000000000	payment	Payment Received	Your payment for ticket TKTDV92GPS7F on 01/07/2025 at 00:00 was successful.	read	2025-06-30 15:31:10.773011	2025-07-03 02:42:46.037731	2025-07-08 05:15:44.025118
30	lytoneterro123@gmail.com	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 08/07/2025 at Unknown is confirmed.	read	2025-07-08 03:48:59.099873	2025-07-08 05:41:47.401906	2025-07-08 05:41:47.401906
11	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 01/07/2025 at 10:00 is confirmed.	read	2025-06-30 23:07:41.331381	2025-07-03 02:50:04.975261	2025-07-08 05:15:44.025118
9	260000000000	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 01/07/2025 at 00:00 is confirmed.	read	2025-06-30 16:11:16.111691	2025-07-03 02:42:48.619416	2025-07-08 05:15:44.025118
19	260000000000	info	Welcome to Tiyende!	Thank you for joining our platform. We hope you enjoy your journey with us.	unread	2025-07-05 05:37:54.925756	\N	2025-07-08 05:15:44.025118
20	260000000000	promo	Special Offer	Get 10% off your next booking when you book 3 days in advance!	unread	2025-07-05 05:37:54.925756	\N	2025-07-08 05:15:44.025118
10	260000000000	payment	Payment Received	Your payment for ticket TKT2UJ2FEXO6 on 01/07/2025 at 00:00 was successful.	read	2025-06-30 16:11:16.112706	2025-07-03 02:42:49.576906	2025-07-08 05:15:44.025118
32	lytoneterro123@gmail.com	booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 10/07/2025 at Unknown is confirmed.	unread	2025-07-09 13:08:08.860626	\N	2025-07-09 13:08:08.860626
24		booking	Booking Confirmed	Your booking for Lusaka → Livingstone on 08/07/2025 at Unknown is confirmed.	unread	2025-07-08 03:15:25.357988	\N	2025-07-08 05:15:44.025118
25		payment	Payment Received	Your payment for ticket TKTWS0VLWY71 on 08/07/2025 at Unknown was successful.	unread	2025-07-08 03:15:25.36007	\N	2025-07-08 05:15:44.025118
33	lytoneterro123@gmail.com	payment	Payment Received	Your payment for ticket TKT2CG2NIWS0 on 10/07/2025 at Unknown was successful.	unread	2025-07-09 13:08:08.862057	\N	2025-07-09 13:08:08.862057
\.


--
-- TOC entry 5214 (class 0 OID 65976)
-- Dependencies: 258
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, vendorid, ticket_id, amount, payment_method, status, created_at, updated_at, reference, customer_email, customer_name) FROM stdin;
11	1	11	470.00	backfill	completed	2025-06-30 14:55:45.591358	2025-07-06 04:38:53.268591	TKT38WRTYLIF		Popi
12	1	12	470.00	backfill	completed	2025-06-30 14:59:14.057665	2025-07-06 04:38:53.268591	TKT09894NFJF		Popi
13	1	13	470.00	backfill	completed	2025-06-30 15:29:46.448804	2025-07-06 04:38:53.268591	TKTSWTXPJHP8		Popi
14	1	14	470.00	backfill	completed	2025-06-30 15:31:10.768558	2025-07-06 04:38:53.268591	TKTDV92GPS7F		Popi
15	1	15	470.00	backfill	completed	2025-06-30 16:11:16.108507	2025-07-06 04:38:53.268591	TKT2UJ2FEXO6		Popi
16	1	16	470.00	backfill	completed	2025-06-30 23:07:41.324873	2025-07-06 04:38:53.268591	TKT86TVJ4KO0		Popi
17	1	17	470.00	backfill	completed	2025-07-02 01:13:06.615961	2025-07-06 04:38:53.268591	TKTP9OS3SVPK		Popi
1	1	1	470.00	cash	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-001	john@example.com	John Doe
2	1	2	470.00	mobile_money	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-002	jane@example.com	Jane Smith
3	1	3	470.00	card	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-003	mike@example.com	Mike Johnson
4	1	4	470.00	cash	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-004	sarah@example.com	Sarah Wilson
5	1	5	470.00	mobile_money	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-005	david@example.com	David Brown
6	1	6	470.00	card	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-006	lisa@example.com	Lisa Davis
7	1	7	470.00	cash	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-007	tom@example.com	Tom Miller
8	1	8	470.00	mobile_money	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-008	amy@example.com	Amy Garcia
9	1	9	470.00	card	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-009	chris@example.com	Chris Rodriguez
10	1	10	470.00	cash	completed	2025-07-06 03:46:46.644834	2025-07-06 03:46:46.644834	PAY-010	emma@example.com	Emma Martinez
\.


--
-- TOC entry 5195 (class 0 OID 65766)
-- Dependencies: 239
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, user_id, emergency_contact, notification_pref, profile_picture, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5203 (class 0 OID 65843)
-- Dependencies: 247
-- Data for Name: read_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.read_notifications (id, user_id, notification_id, read_at) FROM stdin;
1	260000000000	admin_2	2025-07-03 02:27:35.12151
2	260000000000	admin_3	2025-07-03 02:27:35.125356
3	260000000000	admin_14	2025-07-03 02:27:35.126448
4	260000000000	admin_13	2025-07-03 02:27:35.127393
5	260000000000	admin_4	2025-07-03 02:27:35.128281
6	260000000000	admin_5	2025-07-03 02:27:35.129217
7	260000000000	admin_6	2025-07-03 02:27:35.130265
8	260000000000	admin_7	2025-07-03 02:27:35.131196
9	260000000000	admin_8	2025-07-03 02:27:35.132068
10	260000000000	admin_9	2025-07-03 02:27:35.132782
11	260000000000	admin_10	2025-07-03 02:27:35.133492
12	260000000000	admin_11	2025-07-03 02:27:35.134118
13	260000000000	admin_12	2025-07-03 02:27:35.134715
14	260000000000	admin_1	2025-07-03 02:27:35.135455
15	260000000000	booking_17	2025-07-03 02:27:35.136029
16	260000000000	booking_16	2025-07-03 02:27:35.136644
17	260000000000	booking_15	2025-07-03 02:27:35.137324
225	1	admin_15	2025-07-08 05:22:44.841848
226	1	admin_16	2025-07-08 05:22:44.842631
227	1	admin_17	2025-07-08 05:22:44.84338
228	1	admin_18	2025-07-08 05:22:44.843993
229	1	admin_21	2025-07-08 05:22:44.844408
230	1	admin_22	2025-07-08 05:22:44.844752
231	1	admin_23	2025-07-08 05:22:44.845359
232	1	system_1	2025-07-08 05:22:44.845652
257	lytoneterro123@gmail.com	admin_30	2025-07-08 05:33:56.937727
258	lytoneterro123@gmail.com	admin_31	2025-07-08 05:33:58.293922
259	lytoneterro123@gmail.com	admin_29	2025-07-08 05:33:59.108695
260	lytoneterro123@gmail.com	admin_28	2025-07-08 05:33:59.874719
261	lytoneterro123@gmail.com	booking_20	2025-07-08 05:34:00.61263
262	lytoneterro123@gmail.com	booking_21	2025-07-08 05:34:01.434907
\.


--
-- TOC entry 5191 (class 0 OID 57790)
-- Dependencies: 235
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, admin_id, route_id, vendor_id, ticket_id, rating, review, created_at, updated_at, comment) FROM stdin;
2	1	10	1	7	5	\N	2025-06-30 13:17:20.873853	2025-06-30 13:17:20.873853	Nice
\.


--
-- TOC entry 5189 (class 0 OID 57772)
-- Dependencies: 233
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, permissions, color, is_system, created_by_admin_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5177 (class 0 OID 57673)
-- Dependencies: 221
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.routes (id, vendorid, departure, destination, estimatedarrival, fare, capacity, status, daysofweek, kilometers, stops, createdat, updatedat, departuretime) FROM stdin;
1	1	Lusaka	Ndola	2024-01-01 08:00:00	400	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
2	1	Lusaka	Ndola	2024-01-01 14:00:00	450	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
3	1	Ndola	Lusaka	2024-01-01 08:00:00	410	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
4	1	Ndola	Lusaka	2024-01-01 14:00:00	390	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
5	1	Lusaka	Kitwe	2024-01-01 09:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
6	1	Lusaka	Kitwe	2024-01-01 15:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
7	1	Kitwe	Lusaka	2024-01-01 09:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
8	1	Kitwe	Lusaka	2024-01-01 15:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
11	1	Livingstone	Lusaka	2024-01-01 10:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
12	1	Livingstone	Lusaka	2024-01-01 16:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
13	1	Lusaka	Chipata	2024-01-01 11:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
14	1	Lusaka	Chipata	2024-01-01 17:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
15	1	Chipata	Lusaka	2024-01-01 11:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
16	1	Chipata	Lusaka	2024-01-01 17:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
17	1	Lusaka	Solwezi	2024-01-01 11:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
18	1	Lusaka	Solwezi	2024-01-01 17:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
19	1	Solwezi	Lusaka	2024-01-01 11:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
20	1	Solwezi	Lusaka	2024-01-01 17:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
9	1	Lusaka	Livingstone	2024-01-01 10:00:00	500	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{Kafue,Mazabuka,Monze}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	04:00:00
10	1	Lusaka	Livingstone	2024-01-01 16:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{Kafue,Mazabuka,Monze}	2025-06-27 19:04:40.644007	2025-06-27 19:04:40.644007	10:00:00
21	1	Lusaka	Ndola	2024-01-01 08:00:00	400	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
22	1	Lusaka	Ndola	2024-01-01 14:00:00	450	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
23	1	Ndola	Lusaka	2024-01-01 08:00:00	410	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
24	1	Ndola	Lusaka	2024-01-01 14:00:00	390	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	320	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
25	1	Lusaka	Kitwe	2024-01-01 09:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
26	1	Lusaka	Kitwe	2024-01-01 15:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
27	1	Kitwe	Lusaka	2024-01-01 09:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
28	1	Kitwe	Lusaka	2024-01-01 15:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	360	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
29	1	Lusaka	Livingstone	2024-01-01 10:00:00	500	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
30	1	Lusaka	Livingstone	2024-01-01 16:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
31	1	Livingstone	Lusaka	2024-01-01 10:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
32	1	Livingstone	Lusaka	2024-01-01 16:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	485	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
33	1	Lusaka	Chipata	2024-01-01 11:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
34	1	Lusaka	Chipata	2024-01-01 17:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
35	1	Chipata	Lusaka	2024-01-01 11:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
36	1	Chipata	Lusaka	2024-01-01 17:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	570	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
37	1	Lusaka	Solwezi	2024-01-01 11:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
38	1	Lusaka	Solwezi	2024-01-01 17:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
39	1	Solwezi	Lusaka	2024-01-01 11:00:00	460	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
40	1	Solwezi	Lusaka	2024-01-01 17:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	560	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
41	1	Lusaka	Kasama	2024-01-01 15:00:00	500	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	850	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
42	1	Lusaka	Kasama	2024-01-01 21:00:00	470	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	850	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
43	1	Kasama	Lusaka	2024-01-01 15:00:00	480	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	850	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
44	1	Kasama	Lusaka	2024-01-01 21:00:00	490	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	850	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
45	1	Lusaka	Mongu	2024-01-01 11:00:00	400	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	600	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
46	1	Lusaka	Mongu	2024-01-01 17:00:00	420	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	600	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
47	1	Mongu	Lusaka	2024-01-01 11:00:00	410	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	600	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
48	1	Mongu	Lusaka	2024-01-01 17:00:00	430	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	600	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
49	1	Lusaka	Choma	2024-01-01 07:30:00	350	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	285	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
50	1	Lusaka	Choma	2024-01-01 13:30:00	360	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	285	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
51	1	Choma	Lusaka	2024-01-01 07:30:00	370	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	285	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
52	1	Choma	Lusaka	2024-01-01 13:30:00	380	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	285	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
53	1	Lusaka	Kabwe	2024-01-01 06:00:00	350	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	140	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
54	1	Lusaka	Kabwe	2024-01-01 12:00:00	360	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	140	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
55	1	Kabwe	Lusaka	2024-01-01 06:00:00	370	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	140	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
56	1	Kabwe	Lusaka	2024-01-01 12:00:00	380	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	140	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
57	1	Lusaka	Mufulira	2024-01-01 09:30:00	420	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	410	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
58	1	Lusaka	Mufulira	2024-01-01 15:30:00	430	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	410	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
59	1	Mufulira	Lusaka	2024-01-01 09:30:00	410	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	410	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	04:00:00
60	1	Mufulira	Lusaka	2024-01-01 15:30:00	440	44	active	{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}	410	{}	2025-07-07 05:44:22.924109	2025-07-07 05:44:22.924109	10:00:00
\.


--
-- TOC entry 5187 (class 0 OID 57760)
-- Dependencies: 231
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, name, value, description, updated_at) FROM stdin;
1	notification_sms_enabled	false	\N	2025-07-05 04:42:13.602627
\.


--
-- TOC entry 5183 (class 0 OID 57730)
-- Dependencies: 227
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, route_id, vendorid, booking_reference, customer_name, customer_phone, customer_email, seat_number, amount, status, travel_date, created_at, created_by, is_walk_in, user_id) FROM stdin;
5	10	1	TKTZLN8RYS80	Popi	260000000000		5	470	confirmed	2025-07-01 00:00:00	2025-06-30 12:30:37.96469	\N	f	\N
6	10	1	TKT3IRRJDFH2	Popi	260000000000		6	470	confirmed	2025-07-01 00:00:00	2025-06-30 12:44:49.866087	\N	f	\N
7	10	1	TKTG0AXDZRQS	Popi	260000000000		7	470	confirmed	2025-07-01 00:00:00	2025-06-30 12:44:49.873743	\N	f	\N
8	10	1	TKT3DYRPKMO4	Popi	260000000000		8	470	confirmed	2025-07-01 00:00:00	2025-06-30 14:29:00.2126	\N	f	\N
9	10	1	TKTM8G8MLKXP	Popi	260000000000		9	470	confirmed	2025-07-01 00:00:00	2025-06-30 14:40:43.070808	\N	f	\N
10	10	1	TKTNOF04H0DE	Popi	260000000000		10	470	confirmed	2025-07-01 00:00:00	2025-06-30 14:47:04.445197	\N	f	\N
11	10	1	TKT38WRTYLIF	Popi	260000000000		11	470	confirmed	2025-07-01 00:00:00	2025-06-30 14:55:45.591358	\N	f	\N
12	10	1	TKT09894NFJF	Popi	260000000000		12	470	confirmed	2025-07-01 00:00:00	2025-06-30 14:59:14.057665	\N	f	\N
13	10	1	TKTSWTXPJHP8	Popi	260000000000		13	470	confirmed	2025-07-01 00:00:00	2025-06-30 15:29:46.448804	\N	f	\N
14	10	1	TKTDV92GPS7F	Popi	260000000000		14	470	confirmed	2025-07-01 00:00:00	2025-06-30 15:31:10.768558	\N	f	\N
15	10	1	TKT2UJ2FEXO6	Popi	260000000000		15	470	confirmed	2025-07-01 00:00:00	2025-06-30 16:11:16.108507	\N	f	\N
16	10	1	TKT86TVJ4KO0	Popi	260000000000		16	470	confirmed	2025-07-01 00:00:00	2025-06-30 23:07:41.324873	\N	f	\N
17	10	1	TKTP9OS3SVPK	Popi	260000000000		3	470	confirmed	2025-07-01 00:00:00	2025-07-02 01:13:06.615961	\N	f	\N
18	9	1	TKTWS0VLWY71	Lytone Chibona			1	500	confirmed	2025-07-08 00:00:00	2025-07-08 03:15:25.340392	1	f	\N
19	9	1	TKT49N0YB1W8	Lytone Chibona			2	500	confirmed	2025-07-08 00:00:00	2025-07-08 03:33:45.273455	1	f	\N
20	9	1	TKTE9AIMZM6O	Lytone Chibona	lytoneterro123@gmail.com	lytoneterro123@gmail.com	3	500	confirmed	2025-07-08 00:00:00	2025-07-08 03:41:35.767197	1	f	\N
21	29	1	TKT7ERV054P9	Lytone Chibona	lytoneterro123@gmail.com	lytoneterro123@gmail.com	1	500	confirmed	2025-07-08 00:00:00	2025-07-08 03:48:59.095891	1	f	\N
22	9	1	TKT2CG2NIWS0	Lytone Chibona	lytoneterro123@gmail.com	lytoneterro123@gmail.com	1	500	confirmed	2025-07-10 00:00:00	2025-07-09 13:08:08.853184	1	f	\N
61	9	1	BK17521574959961		0977121212	\N	1	500	pending	2025-07-11 00:00:00	2025-07-10 17:24:56.052336	\N	f	\N
62	9	1	BK17521578369731		0977121212	\N	1	500	pending	2025-07-11 00:00:00	2025-07-10 17:30:37.030731	\N	f	\N
63	9	1	BK17521580288781		0977121212	\N	1	500	pending	2025-07-11 00:00:00	2025-07-10 17:33:48.926755	\N	f	9
64	9	1	BK17521590755432		0977121212	\N	2	500	pending	2025-07-11 00:00:00	2025-07-10 17:51:15.599078	\N	f	9
65	9	1	BK17521591830743		0977121212	\N	3	500	pending	2025-07-11 00:00:00	2025-07-10 17:53:03.167819	\N	f	9
66	9	1	BK17521628228184		0977121212	\N	4	500	pending	2025-07-11 00:00:00	2025-07-10 18:53:42.879894	\N	f	9
67	9	1	BK17521666281305		0977121212	\N	5	500	pending	2025-07-11 00:00:00	2025-07-10 19:57:08.19137	\N	f	9
68	9	1	BK17521674262786		0977121212	\N	6	500	pending	2025-07-11 00:00:00	2025-07-10 20:10:26.328881	\N	f	9
1	10	1	TKT17521692911	Popi	260000000000		1	470	confirmed	2025-06-29 00:00:00	2025-06-28 20:36:47.068739	\N	f	\N
2	10	1	TKT17521692912	Popi	260000000000		3	470	confirmed	2025-06-29 00:00:00	2025-06-28 20:36:47.077403	\N	f	\N
3	10	1	TKT17521692913	Popi	260000000000		2	470	confirmed	2025-06-29 00:00:00	2025-06-28 21:30:44.550315	\N	f	\N
4	10	1	TKT17521692914	Popi	260000000000		4	470	confirmed	2025-06-29 00:00:00	2025-06-28 21:45:34.097325	\N	f	\N
69	9	1	BK17521729804547		0977121212	\N	7	500	paid	2025-07-11 00:00:00	2025-07-10 21:43:00.523379	\N	f	9
70	9	1	BK17522203702861		0978765432	\N	1	500	paid	2025-07-12 00:00:00	2025-07-11 10:52:50.335303	\N	f	10
71	9	1	BK17522210216702		0978765432	\N	2	500	paid	2025-07-12 00:00:00	2025-07-11 11:03:41.720415	\N	f	10
72	9	1	BK17522998648341		0977121212	\N	1	500	paid	2025-07-13 00:00:00	2025-07-12 08:57:44.894601	\N	f	9
73	9	1	BK17523002557212		0977121212	\N	2	500	paid	2025-07-13 00:00:00	2025-07-12 09:04:15.768811	\N	f	9
74	9	1	BK17523008973903		0977121212	\N	3	500	paid	2025-07-13 00:00:00	2025-07-12 09:14:57.442322	\N	f	9
\.


--
-- TOC entry 5216 (class 0 OID 66002)
-- Dependencies: 260
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, firebase_uid, email, name, photo_url, phone, provider, created_at, updated_at, password, mobile, username, password_hash) FROM stdin;
1	dev_lytoneterro123_gmail_com	lytoneterro123@gmail.com	Lytone Chibona	https://lh3.googleusercontent.com/a/ACg8ocJWVyOY16wD-1oildgeY5823jMteNIjvCZDNVW-Phw5LKNuqyo=s96-c	\N	google.com	2025-07-08 02:00:36.133345	2025-07-10 10:02:50.49256	\N	\N	\N	\N
2	dev_chibonalytone_gmail_com	chibonalytone@gmail.com	Lytone Chibona	https://lh3.googleusercontent.com/a/ACg8ocLdscHCnltoXluPgRhU7EEptHj1PfvmmDjTKcXR14L2UMUVoA=s96-c	\N	google.com	2025-07-10 10:30:54.671855	2025-07-10 10:30:54.671855	\N	\N	\N	\N
3	randomFirebaseUID123456	william.mwale2024@gmail.com	William	\N	+260971234567	password	2025-07-10 11:15:28.94584	2025-07-10 11:15:28.94584	\N	\N	\N	\N
4	randomFirebaseUID654321	abel.mwale2024@gmail.com	Abel	\N	+260977654321	password	2025-07-10 11:18:16.09313	2025-07-10 11:18:16.09313	Qwerty123	+260978828828	AbelM	\N
5	dev_lytonechibona_gmail_com	lytonechibona@gmail.com	Terrorbyte Hunter	https://lh3.googleusercontent.com/a/ACg8ocI2TtMnH3t02RDpUSpNQ_Q1gXL1Uxz9dwdEjKtmkWcMp-4Av7NDmw=s96-c	\N	google.com	2025-07-10 11:51:33.949395	2025-07-10 11:51:33.949395	\N	\N	\N	\N
8	\N	\N	\N	\N	\N	\N	2025-07-10 13:03:01.794513	2025-07-10 13:03:01.794513	\N	260900000002	testuser2	$2a$10$wH8QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQwW
7	\N	\N	\N	\N	\N	\N	2025-07-10 13:03:01.794513	2025-07-10 13:03:01.794513	\N	260900000001	testuser1	$2a$10$QwQwQwQwQwQwQwQwQwQwOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw
9	Willz-firebase	\N	\N	\N	\N	\N	2025-07-10 13:33:12.382878	2025-07-10 13:33:12.382878	\N	0977121212	Willz	$2a$10$zNMKIiIbrChW7UVBnkn6G.z0Zx.4nKxcqpGraiEm1aYA.cjXMuDq.
10	Raydo-firebase	\N	\N	\N	\N	\N	2025-07-11 10:49:41.062966	2025-07-11 10:49:41.062966	\N	0978765432	Raydo	$2a$10$0aml9L2ZdkIQLM0b76rMYuOG9mW4sFswvmBkdWU0R9HXb9KP7Lvv2
\.


--
-- TOC entry 5208 (class 0 OID 65925)
-- Dependencies: 252
-- Data for Name: vendor_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_notifications (id, user_id, type, title, message, status, created_at, read_at) FROM stdin;
1	1	info	Welcome to Tiyende	Welcome to our platform!	unread	2025-07-05 06:59:27.676922	\N
2	1	warning	System Maintenance	Scheduled maintenance on Sunday	unread	2025-07-05 06:59:27.676922	\N
3	2	info	New Features Available	Check out our latest updates	unread	2025-07-05 06:59:27.676922	\N
\.


--
-- TOC entry 5199 (class 0 OID 65805)
-- Dependencies: 243
-- Data for Name: vendor_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_user_permissions (id, vendor_user_id, permission, granted, granted_by, granted_at, created_at) FROM stdin;
1	1	dashboard_view	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
2	1	routes_view	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
3	1	routes_create	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
4	1	routes_edit	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
5	1	tickets_view	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
6	1	tickets_create	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
7	1	reports_view	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
8	1	settings_view	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
9	1	settings_edit	t	\N	2025-07-06 01:33:47.133356	2025-07-06 01:33:47.133356
\.


--
-- TOC entry 5181 (class 0 OID 57708)
-- Dependencies: 225
-- Data for Name: vendor_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_users (id, vendor_id, username, password, email, full_name, role, active, last_login, token, created_at, updated_at, ip_address) FROM stdin;
1	1	Zambia Intercity Express	$2b$10$O7nDfEnhKan3Hmizb3LaUuZLJdymS/D9eoASb6DkpIyu8C0kOVuAO	info@zambiaexpress.com	Zambia Intercity Express	admin	t	2025-07-07 21:48:35.879	\N	2025-06-27 18:52:01.205605	2025-06-27 18:52:01.205605	\N
2	1	lytonechibona	$2b$12$Rsqv5nKBRl/qoR1r73jPTuk/Ix2Kjyc6k6VSRwp2VfYDH5AmXgfx2	lytonechibona@gmail.com	Lytone Chibona	owner	t	2025-07-07 22:14:16.993	\N	2025-07-08 01:00:59.699711	2025-07-08 01:00:59.699711	\N
\.


--
-- TOC entry 5175 (class 0 OID 57659)
-- Dependencies: 219
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, name, email, phone, status, createdat, updatedat, last_login, ip_address, password, permissions, logo) FROM stdin;
1	Zambia Intercity Express	info@zambiaexpress.com	0970000000	active	2025-06-27 18:52:01.205605	2025-06-27 18:52:01.205605	2025-07-05 22:16:16.41	::1	$2b$10$O7nDfEnhKan3Hmizb3LaUuZLJdymS/D9eoASb6DkpIyu8C0kOVuAO	{dashboard_view,routes_view,routes_create,routes_edit,routes_delete,tickets_view,tickets_create,tickets_edit,tickets_delete,tickets_refund,buses_view,buses_create,buses_edit,buses_delete,schedule_view,schedule_create,schedule_edit,schedule_delete,history_view,reports_view,reports_export,settings_view,settings_edit,admins_view,admins_create,admins_edit,admins_delete,profile_view,profile_edit,support_access}	\N
\.


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 240
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_id_seq', 79, true);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 244
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 58, true);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 255
-- Name: buses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.buses_id_seq', 3, true);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 228
-- Name: completed_trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.completed_trips_id_seq', 1, false);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 253
-- Name: customer_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_notifications_id_seq', 3, true);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 248
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 236
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 64, true);


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 257
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 17, true);


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 238
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profiles_id_seq', 1, false);


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 246
-- Name: read_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.read_notifications_id_seq', 284, true);


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 234
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 2, true);


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 232
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 220
-- Name: routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.routes_id_seq', 60, true);


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 230
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 2, true);


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 226
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 74, true);


--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 259
-- Name: users_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq1', 10, true);


--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 251
-- Name: vendor_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_notifications_id_seq', 3, true);


--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 242
-- Name: vendor_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_user_permissions_id_seq', 9, true);


--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 224
-- Name: vendor_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_users_id_seq', 2, true);


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 218
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, true);


--
-- TOC entry 4929 (class 2606 OID 57656)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 65803)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 65878)
-- Name: admin_permission_overrides admin_permission_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 65835)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 65960)
-- Name: buses buses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 65962)
-- Name: buses buses_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_plate_number_key UNIQUE (plate_number);


--
-- TOC entry 4951 (class 2606 OID 57758)
-- Name: completed_trips completed_trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.completed_trips
    ADD CONSTRAINT completed_trips_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 65947)
-- Name: customer_notifications customer_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_notifications
    ADD CONSTRAINT customer_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 65865)
-- Name: customers customers_mobile_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_mobile_key UNIQUE (mobile);


--
-- TOC entry 4987 (class 2606 OID 65863)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 65759)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 65986)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 65776)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 65849)
-- Name: read_notifications read_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.read_notifications
    ADD CONSTRAINT read_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 66016)
-- Name: read_notifications read_notifications_user_id_notification_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.read_notifications
    ADD CONSTRAINT read_notifications_user_id_notification_id_key UNIQUE (user_id, notification_id);


--
-- TOC entry 4959 (class 2606 OID 57799)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 57783)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 57684)
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 57770)
-- Name: settings settings_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_name_key UNIQUE (name);


--
-- TOC entry 4955 (class 2606 OID 57768)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 57738)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 65949)
-- Name: vendor_user_permissions unique_vendor_user_permission; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT unique_vendor_user_permission UNIQUE (vendor_user_id, permission);


--
-- TOC entry 4939 (class 2606 OID 57706)
-- Name: admins users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5006 (class 2606 OID 66013)
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- TOC entry 4941 (class 2606 OID 57702)
-- Name: admins users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 66011)
-- Name: users users_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 73991)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4991 (class 2606 OID 65935)
-- Name: vendor_notifications vendor_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_notifications
    ADD CONSTRAINT vendor_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 65815)
-- Name: vendor_user_permissions vendor_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 57723)
-- Name: vendor_users vendor_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_email_key UNIQUE (email);


--
-- TOC entry 4945 (class 2606 OID 57719)
-- Name: vendor_users vendor_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 57721)
-- Name: vendor_users vendor_users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_username_key UNIQUE (username);


--
-- TOC entry 4931 (class 2606 OID 57671)
-- Name: vendors vendors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_email_key UNIQUE (email);


--
-- TOC entry 4933 (class 2606 OID 57669)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 1259 OID 65890)
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- TOC entry 4977 (class 1259 OID 65892)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 4978 (class 1259 OID 65891)
-- Name: idx_audit_logs_resource_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs USING btree (resource_type);


--
-- TOC entry 4979 (class 1259 OID 65889)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 4998 (class 1259 OID 65974)
-- Name: idx_buses_assigned_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buses_assigned_route_id ON public.buses USING btree (assigned_route_id);


--
-- TOC entry 4999 (class 1259 OID 65973)
-- Name: idx_buses_vendorid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buses_vendorid ON public.buses USING btree (vendorid);


--
-- TOC entry 4960 (class 1259 OID 65895)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- TOC entry 4961 (class 1259 OID 65894)
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- TOC entry 4962 (class 1259 OID 65896)
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- TOC entry 4963 (class 1259 OID 65893)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 5000 (class 1259 OID 65993)
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_created_at ON public.payments USING btree (created_at);


--
-- TOC entry 5001 (class 1259 OID 65994)
-- Name: idx_payments_ticket_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_ticket_id ON public.payments USING btree (ticket_id);


--
-- TOC entry 5002 (class 1259 OID 65992)
-- Name: idx_payments_vendorid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_vendorid ON public.payments USING btree (vendorid);


--
-- TOC entry 4934 (class 1259 OID 57691)
-- Name: idx_routes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routes_status ON public.routes USING btree (status);


--
-- TOC entry 4935 (class 1259 OID 57690)
-- Name: idx_routes_vendorid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routes_vendorid ON public.routes USING btree (vendorid);


--
-- TOC entry 5007 (class 1259 OID 73989)
-- Name: users_mobile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_mobile_idx ON public.users USING btree (mobile);


--
-- TOC entry 5027 (class 2620 OID 65898)
-- Name: notifications update_notifications_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_notifications_updated_at_trigger BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();


--
-- TOC entry 5022 (class 2606 OID 65879)
-- Name: admin_permission_overrides admin_permission_overrides_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 65884)
-- Name: admin_permission_overrides admin_permission_overrides_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- TOC entry 5024 (class 2606 OID 65968)
-- Name: buses buses_assigned_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_assigned_route_id_fkey FOREIGN KEY (assigned_route_id) REFERENCES public.routes(id);


--
-- TOC entry 5025 (class 2606 OID 65963)
-- Name: buses buses_vendorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id);


--
-- TOC entry 5026 (class 2606 OID 65987)
-- Name: payments payments_vendorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 65777)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 65866)
-- Name: roles roles_created_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_created_by_admin_id_fkey FOREIGN KEY (created_by_admin_id) REFERENCES public.admins(id);


--
-- TOC entry 5012 (class 2606 OID 57685)
-- Name: routes routes_vendorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id);


--
-- TOC entry 5014 (class 2606 OID 65995)
-- Name: tickets tickets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.vendor_users(id);


--
-- TOC entry 5015 (class 2606 OID 57739)
-- Name: tickets tickets_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);


--
-- TOC entry 5016 (class 2606 OID 73992)
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5017 (class 2606 OID 57744)
-- Name: tickets tickets_vendorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id);


--
-- TOC entry 5020 (class 2606 OID 65821)
-- Name: vendor_user_permissions vendor_user_permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.vendor_users(id);


--
-- TOC entry 5021 (class 2606 OID 65816)
-- Name: vendor_user_permissions vendor_user_permissions_vendor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_vendor_user_id_fkey FOREIGN KEY (vendor_user_id) REFERENCES public.vendor_users(id);


--
-- TOC entry 5013 (class 2606 OID 57724)
-- Name: vendor_users vendor_users_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-07-13 13:23:46

--
-- PostgreSQL database dump complete
--

