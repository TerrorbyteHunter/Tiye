PGDMP  "                    }           tiyende    17.4    17.4 �    	           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            
           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    24581    tiyende    DATABASE     m   CREATE DATABASE tiyende WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';
    DROP DATABASE tiyende;
                     postgres    false                        2615    57647    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false                       0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    5                       0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        postgres    false    5            �            1259    57648    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap r       postgres    false    5            �            1259    65795 
   activities    TABLE     �   CREATE TABLE public.activities (
    id integer NOT NULL,
    admin_id integer,
    action text NOT NULL,
    details json,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.activities;
       public         heap r       postgres    false    5            �            1259    65794    activities_id_seq    SEQUENCE     �   CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.activities_id_seq;
       public               postgres    false    241    5                       0    0    activities_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;
          public               postgres    false    240            �            1259    65871    admin_permission_overrides    TABLE     �   CREATE TABLE public.admin_permission_overrides (
    id text NOT NULL,
    admin_id integer NOT NULL,
    permission text NOT NULL,
    granted boolean NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);
 .   DROP TABLE public.admin_permission_overrides;
       public         heap r       postgres    false    5            �            1259    57693    admins    TABLE     d  CREATE TABLE public.admins (
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
    DROP TABLE public.admins;
       public         heap r       postgres    false    5            �            1259    65827 
   audit_logs    TABLE       CREATE TABLE public.audit_logs (
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
    DROP TABLE public.audit_logs;
       public         heap r       postgres    false    5            �            1259    65826    audit_logs_id_seq    SEQUENCE     �   CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.audit_logs_id_seq;
       public               postgres    false    245    5                       0    0    audit_logs_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;
          public               postgres    false    244            �            1259    57750    completed_trips    TABLE     �  CREATE TABLE public.completed_trips (
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
 #   DROP TABLE public.completed_trips;
       public         heap r       postgres    false    5            �            1259    57749    completed_trips_id_seq    SEQUENCE     �   CREATE SEQUENCE public.completed_trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.completed_trips_id_seq;
       public               postgres    false    5    229                       0    0    completed_trips_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.completed_trips_id_seq OWNED BY public.completed_trips.id;
          public               postgres    false    228            �            1259    65853 	   customers    TABLE     �  CREATE TABLE public.customers (
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
    DROP TABLE public.customers;
       public         heap r       postgres    false    5            �            1259    65852    customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.customers_id_seq;
       public               postgres    false    249    5                       0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
          public               postgres    false    248            �            1259    65750    notifications    TABLE     �  CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying(32) NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read_at timestamp without time zone
);
 !   DROP TABLE public.notifications;
       public         heap r       postgres    false    5            �            1259    65749    notifications_id_seq    SEQUENCE     �   CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.notifications_id_seq;
       public               postgres    false    5    237                       0    0    notifications_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
          public               postgres    false    236            �            1259    65766    profiles    TABLE     c  CREATE TABLE public.profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    emergency_contact character varying(50),
    notification_pref character varying(20) DEFAULT 'email'::character varying,
    profile_picture text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.profiles;
       public         heap r       postgres    false    5            �            1259    65765    profiles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.profiles_id_seq;
       public               postgres    false    239    5                       0    0    profiles_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;
          public               postgres    false    238            �            1259    65843    read_notifications    TABLE     �   CREATE TABLE public.read_notifications (
    id integer NOT NULL,
    user_id character varying(20) NOT NULL,
    notification_id character varying(50) NOT NULL,
    read_at timestamp without time zone DEFAULT now()
);
 &   DROP TABLE public.read_notifications;
       public         heap r       postgres    false    5            �            1259    65842    read_notifications_id_seq    SEQUENCE     �   CREATE SEQUENCE public.read_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.read_notifications_id_seq;
       public               postgres    false    5    247                       0    0    read_notifications_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.read_notifications_id_seq OWNED BY public.read_notifications.id;
          public               postgres    false    246            �            1259    57790    reviews    TABLE     }  CREATE TABLE public.reviews (
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
    DROP TABLE public.reviews;
       public         heap r       postgres    false    5            �            1259    57789    reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reviews_id_seq;
       public               postgres    false    5    235                       0    0    reviews_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
          public               postgres    false    234            �            1259    57772    roles    TABLE     �  CREATE TABLE public.roles (
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
    DROP TABLE public.roles;
       public         heap r       postgres    false    5            �            1259    57771    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    233    5                       0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    232            �            1259    57673    routes    TABLE     ~  CREATE TABLE public.routes (
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
    DROP TABLE public.routes;
       public         heap r       postgres    false    5            �            1259    57672    routes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.routes_id_seq;
       public               postgres    false    221    5                       0    0    routes_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.routes_id_seq OWNED BY public.routes.id;
          public               postgres    false    220            �            1259    57760    settings    TABLE     �   CREATE TABLE public.settings (
    id integer NOT NULL,
    name text NOT NULL,
    value text,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.settings;
       public         heap r       postgres    false    5            �            1259    57759    settings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.settings_id_seq;
       public               postgres    false    5    231                       0    0    settings_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;
          public               postgres    false    230            �            1259    57730    tickets    TABLE     �  CREATE TABLE public.tickets (
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.tickets;
       public         heap r       postgres    false    5            �            1259    57729    tickets_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.tickets_id_seq;
       public               postgres    false    227    5                       0    0    tickets_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;
          public               postgres    false    226            �            1259    57692    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    5    223                       0    0    users_id_seq    SEQUENCE OWNED BY     >   ALTER SEQUENCE public.users_id_seq OWNED BY public.admins.id;
          public               postgres    false    222            �            1259    65805    vendor_user_permissions    TABLE     U  CREATE TABLE public.vendor_user_permissions (
    id integer NOT NULL,
    vendor_user_id integer NOT NULL,
    permission text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    granted_by integer,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);
 +   DROP TABLE public.vendor_user_permissions;
       public         heap r       postgres    false    5            �            1259    65804    vendor_user_permissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.vendor_user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.vendor_user_permissions_id_seq;
       public               postgres    false    243    5                       0    0    vendor_user_permissions_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.vendor_user_permissions_id_seq OWNED BY public.vendor_user_permissions.id;
          public               postgres    false    242            �            1259    57708    vendor_users    TABLE     �  CREATE TABLE public.vendor_users (
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
     DROP TABLE public.vendor_users;
       public         heap r       postgres    false    5            �            1259    57707    vendor_users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.vendor_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.vendor_users_id_seq;
       public               postgres    false    5    225                       0    0    vendor_users_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.vendor_users_id_seq OWNED BY public.vendor_users.id;
          public               postgres    false    224            �            1259    57659    vendors    TABLE     �  CREATE TABLE public.vendors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    createdat timestamp without time zone DEFAULT now(),
    updatedat timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    ip_address text
);
    DROP TABLE public.vendors;
       public         heap r       postgres    false    5            �            1259    57658    vendors_id_seq    SEQUENCE     �   CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.vendors_id_seq;
       public               postgres    false    219    5                       0    0    vendors_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;
          public               postgres    false    218                       2604    65798    activities id    DEFAULT     n   ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);
 <   ALTER TABLE public.activities ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    241    240    241            �           2604    57696 	   admins id    DEFAULT     e   ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 8   ALTER TABLE public.admins ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222    223                       2604    65830    audit_logs id    DEFAULT     n   ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);
 <   ALTER TABLE public.audit_logs ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    245    245            �           2604    57753    completed_trips id    DEFAULT     x   ALTER TABLE ONLY public.completed_trips ALTER COLUMN id SET DEFAULT nextval('public.completed_trips_id_seq'::regclass);
 A   ALTER TABLE public.completed_trips ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    228    229                       2604    65856    customers id    DEFAULT     l   ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);
 ;   ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    248    249    249            �           2604    65753    notifications id    DEFAULT     t   ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
 ?   ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    236    237            �           2604    65769    profiles id    DEFAULT     j   ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);
 :   ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    239    239            	           2604    65846    read_notifications id    DEFAULT     ~   ALTER TABLE ONLY public.read_notifications ALTER COLUMN id SET DEFAULT nextval('public.read_notifications_id_seq'::regclass);
 D   ALTER TABLE public.read_notifications ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    247    246    247            �           2604    57793 
   reviews id    DEFAULT     h   ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);
 9   ALTER TABLE public.reviews ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    234    235            �           2604    57775    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    233    233            �           2604    57676 	   routes id    DEFAULT     f   ALTER TABLE ONLY public.routes ALTER COLUMN id SET DEFAULT nextval('public.routes_id_seq'::regclass);
 8   ALTER TABLE public.routes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    220    221            �           2604    57763    settings id    DEFAULT     j   ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);
 :   ALTER TABLE public.settings ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    231    231            �           2604    57733 
   tickets id    DEFAULT     h   ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);
 9   ALTER TABLE public.tickets ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    227    227                       2604    65808    vendor_user_permissions id    DEFAULT     �   ALTER TABLE ONLY public.vendor_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.vendor_user_permissions_id_seq'::regclass);
 I   ALTER TABLE public.vendor_user_permissions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    243    242    243            �           2604    57711    vendor_users id    DEFAULT     r   ALTER TABLE ONLY public.vendor_users ALTER COLUMN id SET DEFAULT nextval('public.vendor_users_id_seq'::regclass);
 >   ALTER TABLE public.vendor_users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    225    225            �           2604    57662 
   vendors id    DEFAULT     h   ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);
 9   ALTER TABLE public.vendors ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    219    219            �          0    57648    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               postgres    false    217   Z�       �          0    65795 
   activities 
   TABLE DATA           P   COPY public.activities (id, admin_id, action, details, "timestamp") FROM stdin;
    public               postgres    false    241   w�                 0    65871    admin_permission_overrides 
   TABLE DATA           o   COPY public.admin_permission_overrides (id, admin_id, permission, granted, created_by, created_at) FROM stdin;
    public               postgres    false    250   B�       �          0    57693    admins 
   TABLE DATA           �   COPY public.admins (id, username, password, email, full_name, role, active, last_login, token, avatar_url, ip_address) FROM stdin;
    public               postgres    false    223   D�                 0    65827 
   audit_logs 
   TABLE DATA           �   COPY public.audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) FROM stdin;
    public               postgres    false    245   ��       �          0    57750    completed_trips 
   TABLE DATA           �   COPY public.completed_trips (id, route_id, vendor_id, departure, destination, departure_time, arrival_time, passenger_count, revenue, rating, completed_at) FROM stdin;
    public               postgres    false    229   &�                 0    65853 	   customers 
   TABLE DATA           w   COPY public.customers (id, mobile, name, email, avatar_url, is_active, last_login, created_at, updated_at) FROM stdin;
    public               postgres    false    249   C�       �          0    65750    notifications 
   TABLE DATA           g   COPY public.notifications (id, user_id, type, title, message, status, created_at, read_at) FROM stdin;
    public               postgres    false    237   ��       �          0    65766    profiles 
   TABLE DATA           ~   COPY public.profiles (id, user_id, emergency_contact, notification_pref, profile_picture, created_at, updated_at) FROM stdin;
    public               postgres    false    239   ]�                 0    65843    read_notifications 
   TABLE DATA           S   COPY public.read_notifications (id, user_id, notification_id, read_at) FROM stdin;
    public               postgres    false    247   z�       �          0    57790    reviews 
   TABLE DATA           �   COPY public.reviews (id, admin_id, route_id, vendor_id, ticket_id, rating, review, created_at, updated_at, comment) FROM stdin;
    public               postgres    false    235   H�       �          0    57772    roles 
   TABLE DATA           �   COPY public.roles (id, name, description, permissions, color, is_system, created_by_admin_id, created_at, updated_at) FROM stdin;
    public               postgres    false    233   ��       �          0    57673    routes 
   TABLE DATA           �   COPY public.routes (id, vendorid, departure, destination, estimatedarrival, fare, capacity, status, daysofweek, kilometers, stops, createdat, updatedat, departuretime) FROM stdin;
    public               postgres    false    221   ��       �          0    57760    settings 
   TABLE DATA           L   COPY public.settings (id, name, value, description, updated_at) FROM stdin;
    public               postgres    false    231   P�       �          0    57730    tickets 
   TABLE DATA           �   COPY public.tickets (id, route_id, vendorid, booking_reference, customer_name, customer_phone, customer_email, seat_number, amount, status, travel_date, created_at) FROM stdin;
    public               postgres    false    227   ��       �          0    65805    vendor_user_permissions 
   TABLE DATA           ~   COPY public.vendor_user_permissions (id, vendor_user_id, permission, granted, granted_by, granted_at, created_at) FROM stdin;
    public               postgres    false    243   s�       �          0    57708    vendor_users 
   TABLE DATA           �   COPY public.vendor_users (id, vendor_id, username, password, email, full_name, role, active, last_login, token, created_at, updated_at) FROM stdin;
    public               postgres    false    225   ��       �          0    57659    vendors 
   TABLE DATA           o   COPY public.vendors (id, name, email, phone, status, createdat, updatedat, last_login, ip_address) FROM stdin;
    public               postgres    false    219   ��                  0    0    activities_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.activities_id_seq', 70, true);
          public               postgres    false    240                        0    0    audit_logs_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.audit_logs_id_seq', 50, true);
          public               postgres    false    244            !           0    0    completed_trips_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.completed_trips_id_seq', 1, false);
          public               postgres    false    228            "           0    0    customers_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.customers_id_seq', 1, true);
          public               postgres    false    248            #           0    0    notifications_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.notifications_id_seq', 18, true);
          public               postgres    false    236            $           0    0    profiles_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.profiles_id_seq', 1, false);
          public               postgres    false    238            %           0    0    read_notifications_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.read_notifications_id_seq', 222, true);
          public               postgres    false    246            &           0    0    reviews_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.reviews_id_seq', 2, true);
          public               postgres    false    234            '           0    0    roles_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.roles_id_seq', 1, false);
          public               postgres    false    232            (           0    0    routes_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.routes_id_seq', 20, true);
          public               postgres    false    220            )           0    0    settings_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.settings_id_seq', 2, true);
          public               postgres    false    230            *           0    0    tickets_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.tickets_id_seq', 17, true);
          public               postgres    false    226            +           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 4, true);
          public               postgres    false    222            ,           0    0    vendor_user_permissions_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.vendor_user_permissions_id_seq', 1, false);
          public               postgres    false    242            -           0    0    vendor_users_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.vendor_users_id_seq', 1, false);
          public               postgres    false    224            .           0    0    vendors_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.vendors_id_seq', 1, true);
          public               postgres    false    218                       2606    57656 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 postgres    false    217            7           2606    65803    activities activities_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.activities DROP CONSTRAINT activities_pkey;
       public                 postgres    false    241            I           2606    65878 :   admin_permission_overrides admin_permission_overrides_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_pkey PRIMARY KEY (id);
 d   ALTER TABLE ONLY public.admin_permission_overrides DROP CONSTRAINT admin_permission_overrides_pkey;
       public                 postgres    false    250            ;           2606    65835    audit_logs audit_logs_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
       public                 postgres    false    245            )           2606    57758 $   completed_trips completed_trips_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.completed_trips
    ADD CONSTRAINT completed_trips_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.completed_trips DROP CONSTRAINT completed_trips_pkey;
       public                 postgres    false    229            E           2606    65865    customers customers_mobile_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_mobile_key UNIQUE (mobile);
 H   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_mobile_key;
       public                 postgres    false    249            G           2606    65863    customers customers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
       public                 postgres    false    249            3           2606    65759     notifications notifications_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
       public                 postgres    false    237            5           2606    65776    profiles profiles_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
       public                 postgres    false    239            A           2606    65849 *   read_notifications read_notifications_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.read_notifications
    ADD CONSTRAINT read_notifications_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.read_notifications DROP CONSTRAINT read_notifications_pkey;
       public                 postgres    false    247            C           2606    65851 A   read_notifications read_notifications_user_id_notification_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.read_notifications
    ADD CONSTRAINT read_notifications_user_id_notification_id_key UNIQUE (user_id, notification_id);
 k   ALTER TABLE ONLY public.read_notifications DROP CONSTRAINT read_notifications_user_id_notification_id_key;
       public                 postgres    false    247    247            1           2606    57799    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public                 postgres    false    235            /           2606    57783    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    233                       2606    57684    routes routes_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.routes DROP CONSTRAINT routes_pkey;
       public                 postgres    false    221            +           2606    57770    settings settings_name_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_name_key UNIQUE (name);
 D   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_name_key;
       public                 postgres    false    231            -           2606    57768    settings settings_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_pkey;
       public                 postgres    false    231            '           2606    57738    tickets tickets_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_pkey;
       public                 postgres    false    227                       2606    57706    admins users_email_key 
   CONSTRAINT     R   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT users_email_key UNIQUE (email);
 @   ALTER TABLE ONLY public.admins DROP CONSTRAINT users_email_key;
       public                 postgres    false    223                       2606    57702    admins users_pkey 
   CONSTRAINT     O   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 ;   ALTER TABLE ONLY public.admins DROP CONSTRAINT users_pkey;
       public                 postgres    false    223                       2606    57704    admins users_username_key 
   CONSTRAINT     X   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT users_username_key UNIQUE (username);
 C   ALTER TABLE ONLY public.admins DROP CONSTRAINT users_username_key;
       public                 postgres    false    223            9           2606    65815 4   vendor_user_permissions vendor_user_permissions_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_pkey PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public.vendor_user_permissions DROP CONSTRAINT vendor_user_permissions_pkey;
       public                 postgres    false    243            !           2606    57723 #   vendor_users vendor_users_email_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_email_key UNIQUE (email);
 M   ALTER TABLE ONLY public.vendor_users DROP CONSTRAINT vendor_users_email_key;
       public                 postgres    false    225            #           2606    57719    vendor_users vendor_users_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.vendor_users DROP CONSTRAINT vendor_users_pkey;
       public                 postgres    false    225            %           2606    57721 &   vendor_users vendor_users_username_key 
   CONSTRAINT     e   ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_username_key UNIQUE (username);
 P   ALTER TABLE ONLY public.vendor_users DROP CONSTRAINT vendor_users_username_key;
       public                 postgres    false    225                       2606    57671    vendors vendors_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.vendors DROP CONSTRAINT vendors_email_key;
       public                 postgres    false    219                       2606    57669    vendors vendors_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.vendors DROP CONSTRAINT vendors_pkey;
       public                 postgres    false    219            <           1259    65890    idx_audit_logs_action    INDEX     N   CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);
 )   DROP INDEX public.idx_audit_logs_action;
       public                 postgres    false    245            =           1259    65892    idx_audit_logs_created_at    INDEX     V   CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);
 -   DROP INDEX public.idx_audit_logs_created_at;
       public                 postgres    false    245            >           1259    65891    idx_audit_logs_resource_type    INDEX     \   CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs USING btree (resource_type);
 0   DROP INDEX public.idx_audit_logs_resource_type;
       public                 postgres    false    245            ?           1259    65889    idx_audit_logs_user_id    INDEX     P   CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);
 *   DROP INDEX public.idx_audit_logs_user_id;
       public                 postgres    false    245                       1259    57691    idx_routes_status    INDEX     F   CREATE INDEX idx_routes_status ON public.routes USING btree (status);
 %   DROP INDEX public.idx_routes_status;
       public                 postgres    false    221                       1259    57690    idx_routes_vendorid    INDEX     J   CREATE INDEX idx_routes_vendorid ON public.routes USING btree (vendorid);
 '   DROP INDEX public.idx_routes_vendorid;
       public                 postgres    false    221            R           2606    65879 C   admin_permission_overrides admin_permission_overrides_admin_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;
 m   ALTER TABLE ONLY public.admin_permission_overrides DROP CONSTRAINT admin_permission_overrides_admin_id_fkey;
       public               postgres    false    223    4893    250            S           2606    65884 E   admin_permission_overrides admin_permission_overrides_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.admin_permission_overrides
    ADD CONSTRAINT admin_permission_overrides_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);
 o   ALTER TABLE ONLY public.admin_permission_overrides DROP CONSTRAINT admin_permission_overrides_created_by_fkey;
       public               postgres    false    223    4893    250            O           2606    65777    profiles profiles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admins(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_user_id_fkey;
       public               postgres    false    239    4893    223            N           2606    65866 $   roles roles_created_by_admin_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_created_by_admin_id_fkey FOREIGN KEY (created_by_admin_id) REFERENCES public.admins(id);
 N   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_created_by_admin_id_fkey;
       public               postgres    false    4893    233    223            J           2606    57685    routes routes_vendorid_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id);
 E   ALTER TABLE ONLY public.routes DROP CONSTRAINT routes_vendorid_fkey;
       public               postgres    false    219    221    4885            L           2606    57739    tickets tickets_route_id_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);
 G   ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_route_id_fkey;
       public               postgres    false    221    227    4889            M           2606    57744    tickets tickets_vendorid_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_vendorid_fkey FOREIGN KEY (vendorid) REFERENCES public.vendors(id);
 G   ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_vendorid_fkey;
       public               postgres    false    219    227    4885            P           2606    65821 ?   vendor_user_permissions vendor_user_permissions_granted_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.vendor_users(id);
 i   ALTER TABLE ONLY public.vendor_user_permissions DROP CONSTRAINT vendor_user_permissions_granted_by_fkey;
       public               postgres    false    243    4899    225            Q           2606    65816 C   vendor_user_permissions vendor_user_permissions_vendor_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.vendor_user_permissions
    ADD CONSTRAINT vendor_user_permissions_vendor_user_id_fkey FOREIGN KEY (vendor_user_id) REFERENCES public.vendor_users(id);
 m   ALTER TABLE ONLY public.vendor_user_permissions DROP CONSTRAINT vendor_user_permissions_vendor_user_id_fkey;
       public               postgres    false    243    4899    225            K           2606    57724 (   vendor_users vendor_users_vendor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.vendor_users
    ADD CONSTRAINT vendor_users_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);
 R   ALTER TABLE ONLY public.vendor_users DROP CONSTRAINT vendor_users_vendor_id_fkey;
       public               postgres    false    225    4885    219            �      xڋ���� � �      �   �	  x�՛I������O!��ܜ��4q��O` ���"�D��y���YD�R��L�����_���_E
?��_MץU�Z��&|�כ�����o�oX2)Y���sZ�P�� ��|�&�߅ag�I�=�W�δ�bS����՜����h��oiV�n�ˇF.�~/���$ط�wu��ߌ�Sڿ�T�T����?���]�ff�Wdշ��I[�-�3����Ջ�6}��ާ��z��!:A�?"���D���1\��|��O��WIq��
#s:�PE^֔��{oS0(�s�r&/a�%�8u�*�i�Ԣ��\����*Ͷ`@ W+� �E�h���8�%$3$KC�������V�P�g�Ud�LΒV;|F�'_����1�C�ρ��`0j��c~	�,	I�#Va�$�X��tL87)��m����b���E�H;rE_v���x�e�鲯x�7��c[\�Kg�+M��B����tB�i���rFf�V��K�Z�ϒ�U�
�x<�~��*(����k��e��#h�b�H^$I�r0Z������㌑	�P�J������	u��gI#,�*���q[�*h2?*�~-ǭ��-�x�(e�����1��#��`M��T u����eϠ;�ΒF\a��OLC�M���?��7�XD�A���E� �*Iɴ����!�&�Q���ez^l��3(f.��k�U��C�Xw�������O����R�I˭� �s���8�67>���og��~�Rd��]).���%��^�|�KS�a_bY�W� �P���x��7��4�D	�^w}Mچ=�@;��UXwc�-x������PE�W����	-`!�R���gI�u��sO�A�^����EZFslk `M�\��"+iDqȺ�^��"�Q�h1ֲ	[��.��+\^��i<IP��!d%-������-�e쳤��\�4%1�P���F?=z�t65��	�uY��$Qx��[�C�7��c5W���GX5���Fc��0���>p1pYJ�II&�np��T�U�a�X�d6E�T�fC���Xdc%θ��Y�qk�~6^P�����$�*+fi]_c�ϒ�y#���kd��fڮC�w_�>KB9D=|�eeXZ����8-�|���Cc��Q��,�����jfv){�`�m_�������UAx�l8z�l��(_fc%���P�9����F�zl;�h����_%��C��� ���NjhXǢ�u4�elxdl3���z�Γ$LPԡd�Na�a�թ���@��;5I��2�M��I�\8���Qes�4떘��4c\��F�b�f��^$�T[��kd��&���S;�\�,>K	݄���Hg��>�y>��j	�2o����:-ñ�D:T���0	b�pX�u��C�����yX_ac%l�PQ�����\��	�)���}�`y���2�w�����ec��?�N��b=-v��l�$Ƒv��I��I��t+��̎���@^���J`^��V��0�CS�' D/d�Y"
:	��8�����N�I��Iڰ�h�)k	Wi��JZi��`��#��by8A5�&�G덣Q.�l�����77�&��L�<(i���0���nkakV�GI_%���V]�50�C3����^�>K�nK�\S%y�-�,��ڔq���� 8�/�y�`X eo0Mj$ʟe��Sُ���T���`�r��J\٤]uMW�\n�����2�����a��8MA�aٗ,+jZx%���n�3�G��B��URX8��T�:KMǆ�}6��7��p`�R�q<IX(�p�����������@�D�Km���K�^%�r���׆��>�¹�/�Ο�M� ��3t	�,a���o0h���{ݐ�h�E����a�g�T�q�4ǐ�X����CE[C�(k��6D��;k�0��������Y�a��u�T]"�i,�E׌��O��p�<
�A�/�XH�6�_�q-8�8u��_'gIQ���op^L!��U'֑���9���pb�I����B]�8KP�����ӱ�K�&��6]Ƽ0ۢ��w�h<KQ[������E��~[�h@������?�i�� �k�Ub�q�����aU#N>�n�H�]�)L�gi����D�,)Fq��3G��C�V^�s5���xS0��(�2�.a�%�����{x�az��{���^�5@��>��~�������?eoZ{�鲾���t�S�=,��jM]�c�����������}:|���9��G�������g[�p�䳫��<�?_����G�9��^.�h��} N����=ֶ�S.����a~0�Y�(�L���^�����1~Dz����S��3Vg�>-���1�P,����pUmZ��r��"
+���	qgċ�\%]������5�E�,�S�������x���]�M�Ja�`����`Ħ>�JX�b��Dwƻ�w<�Ү�\�<��u�?���`         �   x�u�ۍ�0��g�b�5����b�V�2(�>����O�#ϛ�1��q��Fm�(\�=3�IM����L~u~�J��}{�#d+U��QS�_��nѳQ~^~?�}�|���L�V�G�x�`[�{�R��J#Z��+uC�F���]�Q��Y ��䚑�R΄�0�}*�- ��ĒV6.�q���!Vyi�Qv�0ƽLϛn��A+ߟ4C�?{'r��ı��^��� E���u��d�      �   m  x�MP�n�0<�W��k������<�ik�iL��ŀ		n!|}I�'U�]�ff���G#Ni�dmL�lb�ɝ��*#�c	��1mb���E�� �e��0�KOը�_>�OUS	���v�oз���6��[��x��g�mM]C��}rIe�����-�����.��G�5����y'sF*��>��ѐ�?��Y\}`�I��v�6�c�f�N���U����2>$�͑?F�	Cv��C�r������y=�=)�u/E�?ϣJ<"I��.Y�]$]��h�T�h[��ߑ'�k ��}w~Ղ�����8�x'�lf��O*��v����Y��O��Vu�P������hu�ۍY�6��|�L��x��I         U  x�ݙKo�8��� tj���̐ɜ������uY`�Xl#ı=�����AS��=,��âd���<IA��z���T�<]�ɷz�W�4�u��9���M{��X��M���W1B�f�o�^��Vi��S�鶷�|�^�V�B�3�g����:}J�����R���'��|����\��I��V�ۧ��հ�I��w���������}�B���n�i����H�(��X��N�� B�:RZ�0%`��]�
[" E� F�'�@���@Rs ���N�B j��u"
���'@K`�`P& $���ȗݗ�ky8��(�4
,
0�� �}MN�а���y��bk�3� ���4�OS�_q�oq�y��Se�1��V�_Nt�xa9P��2�
��B���j�x'�y/���\�@9�P�((�qL��@�ɋϐ�]�WH^�[��,��~�����@��:��,�_Q��!�VV{A�l0���#(�٩���l�<��1�j�	�aJ���Ów�<A�d5ǆGA�X�J�U�a�jJ��de�;��+���r��[}���mWGYߦ��L�s�����
�W��Ƚ*��h9��jFֲR;�j�����ui��<����<��mإq�7��o7���m��<�N���D�h�Y��诉�0�'�����N~�_�o�p�ީ��<�u�����~$��@,��.�����u��b��� Ya<L�ݬ�z��ǒ�Hăw����<�4=9�E�>n����ػ5b�$�)#t�E���c��C�XbsZ�s,ΗY<����nI9.�&�a��a��S�G���K	!~ �$��      �      xڋ���� � �         H   x�3�423�C΂��|0ᐞ����������Y"��Lu�u�M�L���L�L�q�p��qqq �'4      �   �  x�Ֆ�N�@���O���*��=����B(D�� q�Me��ȎA}�>@�OҵI@�&E�Ev����柃�@~��y���]���"g�ԟE'E]�y������Uz��_?~���2|[͊��"�I�i��PTp�)�q��۟�7\����j�˜n�eq�Ӝ��ԗ4ɦ�5�*:Z�0�J��E����)�X�Xi������r+KǔE�w��H�O}>��wz�G>�\$7���Ͳѹ��d'��� 9��ԣWiE�z4�U5�'+��D�'������2]w1(�tg���Z�u�S{���\�s	iT04B"�/�t+dJ0]�&�T���>p�C9<�4�q��f�M*�Qh�ZQ��$d̑��qׅJ1��%�#��|��K��:KĺQ`OrAp}��G���q`��շ�����K�DEG̳�W� ��KΌ �X1c%M�	���䰯v��#Z�����R�⚎�+R#jb���p���`hz����~X�+9t<�B�p�@�违�e�AZ�48<q�Gc�bd ���b�¼)@|��_���u���n�[^ax��9�:xu�EYL�()�t�J�i�(�¥�o'����FٮF��d6, !��=t�|��i�B��uf�f��77�5Ÿ�h�I�PashQ�V�ޑi���_�A[�h�2B�o���      �      xڋ���� � �         �   x�u�A�BA���S�44��YL�LL�����w3�
n�_������覢~�<�}��4O�G*��
X�<`��hH�11J�MI[�H7d�$�ވ�Ld%�&�Y�l���*1A���HNYXcc��L�ݩ4��W����$��o���G�?����q���t�.0�%�o�٨�s,M�G /�۵�      �   <   x�3�4�44 朦�1~�FF��f��
��V��VFz�������2�S�b���� 8��      �      xڋ���� � �      �   �  x�͖Oo�0���S�����Kvq��.�t��F��f��Z:R�YHJ(!Ч����j�V��΋�"1�ـ�m=��(��0w0�>K���8)����*�u�7=�/�ٲڜ;��NSUV�s�rO�HSr<�1���A,{��(1:̎"C���'���jf�f�W��2_`�䭞�S�Y���d���}6Ʀ���Y�Yb1�"��fN���x��+lK�ϢS�� ���u�3��ٙ�k[y+:ŎK9�n��l��{�_�OK��[l�6�%F����%v�{��vE��m		`�$�"�-���d[��L��^L�m���oH��}I����b׼��m��_,���mۙ��ߍ�m��s��E��uP�J���������ث}:��yFQ��/�      �   L   x�3���/�L�LN,��ϋ/�-�O�KL�IM�LK�)N���4202�50�50U00�21�24�330232����� ���      �   �  xڝ��n�0��~�q��
8��U��rkR �6E��P�-�C	������3?66χ�}��֐��5�.�/�߿����������)� ����AbM�-h������� �՛*{cbH"�9`tFn�������虜qz��iwݥPR\Q�s���u�6�h4:"|�u��rM%D��$�U��QY�����ܗ�Qų6a�eq����(%%T*�(�%$5q4�a����-�ڐ�V�Ws5�2��d����A���q�A��,<v�ew�,:X�8��ٺ���<4:C��rSv�މ	��8�����ùݬ�Pt��q����A��)Ҫ�}y�v����ݦ��-��G-:�!�	��!8�{0�@�ᴑ���5X��	|�L����m<�ܟ���'~��5�A�%Kj]T4����jX      �      xڋ���� � �      �      xڋ���� � �      �   f   x�3�J�M�LT��+I-J�,�Tp�((J-.���K�w�˦B����s9,� �31�$�,�����T��L��\��������P�������T�q��qqq �#*     