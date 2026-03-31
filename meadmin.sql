--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 17.0

-- Started on 2026-03-31 22:14:21

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

ALTER TABLE ONLY example_demo_books DROP CONSTRAINT example_demo_books_example_book_id_fkey1;
DROP INDEX user_username_unique;
DROP INDEX user_mobile_unique;
DROP INDEX user_email_unique;
DROP INDEX system_role_role_key_unique;
DROP INDEX system_menu_rule_unique;
DROP INDEX system_admin_username_unique;
DROP INDEX system_admin_mobile_unique;
DROP INDEX system_admin_email_unique;
DROP INDEX "systemAdminRule";
DROP INDEX example_demo_mobile_unique;
ALTER TABLE ONLY "user" DROP CONSTRAINT user_pkey;
ALTER TABLE ONLY user_file DROP CONSTRAINT user_file_pkey;
ALTER TABLE ONLY system_role DROP CONSTRAINT system_role_pkey;
ALTER TABLE ONLY system_menu DROP CONSTRAINT system_menu_pkey;
ALTER TABLE ONLY system_admin DROP CONSTRAINT system_admin_pkey;
ALTER TABLE ONLY role_menu DROP CONSTRAINT role_menu_pkey;
ALTER TABLE ONLY file DROP CONSTRAINT file_pkey;
ALTER TABLE ONLY example_demo DROP CONSTRAINT example_demo_pkey;
ALTER TABLE ONLY example_demo_files DROP CONSTRAINT example_demo_files_pkey;
ALTER TABLE ONLY example_demo_books DROP CONSTRAINT example_demo_books_pkey1;
ALTER TABLE ONLY example_book DROP CONSTRAINT example_book_pkey;
DROP TABLE user_file;
DROP TABLE "user";
DROP TABLE system_role;
DROP TABLE system_menu;
DROP TABLE system_admin;
DROP TABLE role_menu;
DROP TABLE file;
DROP TABLE example_demo_files;
DROP TABLE example_demo_books;
DROP TABLE example_demo;
DROP TABLE example_book;
DROP TABLE admin_role;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 27852)
-- Name: admin_role; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE admin_role (
    system_role_id character varying(20) NOT NULL,
    system_admin_id character varying(20) NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 28100)
-- Name: example_book; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE example_book (
    id character varying(20) NOT NULL,
    name character varying(20) DEFAULT ''::character varying NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20),
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


--
-- TOC entry 3444 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE example_book; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE example_book IS '示例_书籍';


--
-- TOC entry 3445 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN example_book.name; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_book.name IS '名称';


--
-- TOC entry 3446 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN example_book.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_book.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3447 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN example_book.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_book.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3448 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN example_book.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_book.created_at IS '创建时间';


--
-- TOC entry 3449 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN example_book.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_book.updated_at IS '最后更新时间';


--
-- TOC entry 231 (class 1259 OID 27859)
-- Name: example_demo; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE example_demo (
    id character varying(20) NOT NULL,
    name character varying(20) DEFAULT ''::character varying NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20),
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    mobile character varying(11),
    type smallint DEFAULT 0 NOT NULL,
    user_id character varying(20),
    avatar_file_id character varying(20),
    deleted_at timestamp(6) with time zone
);


--
-- TOC entry 3450 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE example_demo; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE example_demo IS '示例_Demo';


--
-- TOC entry 3451 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.name; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.name IS '名称';


--
-- TOC entry 3452 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3453 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3454 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.created_at IS '创建时间';


--
-- TOC entry 3455 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.updated_at IS '最后更新时间';


--
-- TOC entry 3456 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.mobile; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.mobile IS '手机号';


--
-- TOC entry 3457 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.type; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.type IS '类型:0=书籍;1=电子产品;2=卡片';


--
-- TOC entry 3458 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.user_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.user_id IS '关联前台用户id';


--
-- TOC entry 3459 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.avatar_file_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.avatar_file_id IS '头像附件id';


--
-- TOC entry 3460 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN example_demo.deleted_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN example_demo.deleted_at IS '删除时间';


--
-- TOC entry 241 (class 1259 OID 29477)
-- Name: example_demo_books; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE example_demo_books (
    example_book_id character varying(20) NOT NULL,
    example_demo_id character varying(20) NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 27867)
-- Name: example_demo_files; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE example_demo_files (
    file_id character varying(20) NOT NULL,
    example_demo_id character varying(20) NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 27870)
-- Name: file; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE file (
    id character varying(20) NOT NULL,
    name character varying(300) DEFAULT ''::character varying NOT NULL,
    mime_type character varying(50) DEFAULT ''::character varying NOT NULL,
    size integer,
    storage character varying(50) DEFAULT 'storage'::character varying NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20),
    path character varying(200) DEFAULT ''::character varying NOT NULL,
    md5 character varying(32) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 3461 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE file; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE file IS '附件表';


--
-- TOC entry 3462 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.name; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.name IS '文件名';


--
-- TOC entry 3463 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.mime_type; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.mime_type IS 'mime类型';


--
-- TOC entry 3464 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.size; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.size IS '文件大小(b)';


--
-- TOC entry 3465 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.storage; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.storage IS '存储引擎';


--
-- TOC entry 3466 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.created_at IS '创建时间';


--
-- TOC entry 3467 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.updated_at IS '最后更新时间';


--
-- TOC entry 3468 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.path; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.path IS '路径';


--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN file.md5; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN file.md5 IS '文件MD5值';


--
-- TOC entry 234 (class 1259 OID 27880)
-- Name: role_menu; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE role_menu (
    system_menu_id character varying(20) NOT NULL,
    system_role_id character varying(20) NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 27883)
-- Name: system_admin; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE system_admin (
    id character varying(20) NOT NULL,
    username character varying(50) DEFAULT ''::character varying NOT NULL,
    nickname character varying(20) DEFAULT ''::character varying NOT NULL,
    password character varying(64) DEFAULT ''::character varying NOT NULL,
    salt character varying(32) DEFAULT ''::character varying NOT NULL,
    email character varying(100),
    mobile character varying(11),
    login_failure smallint DEFAULT 0 NOT NULL,
    last_login_at timestamp with time zone,
    last_login_ip character varying(50) DEFAULT ''::character varying NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20),
    deleted_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    avatar_file_id character varying(20)
);


--
-- TOC entry 3472 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE system_admin; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE system_admin IS '管理员表';


--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.username; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.username IS '用户名';


--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.nickname; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.nickname IS '昵称';


--
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.password; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.password IS '密码';


--
-- TOC entry 3476 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.salt; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.salt IS '密码盐';


--
-- TOC entry 3477 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.email; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.email IS '邮箱';


--
-- TOC entry 3478 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.mobile; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.mobile IS '手机号';


--
-- TOC entry 3479 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.login_failure; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.login_failure IS '登录失败次数';


--
-- TOC entry 3480 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.last_login_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.last_login_at IS '登录时间';


--
-- TOC entry 3481 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.last_login_ip; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.last_login_ip IS '登录ip';


--
-- TOC entry 3482 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.status; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.status IS '状态:1=启用;0=禁用';


--
-- TOC entry 3483 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3484 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3485 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.deleted_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.deleted_at IS '删除时间';


--
-- TOC entry 3486 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.created_at IS '创建时间';


--
-- TOC entry 3487 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.updated_at IS '最后更新时间';


--
-- TOC entry 3488 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN system_admin.avatar_file_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_admin.avatar_file_id IS '头像附件id';


--
-- TOC entry 236 (class 1259 OID 27893)
-- Name: system_menu; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE system_menu (
    id character varying(20) NOT NULL,
    title character varying(100) DEFAULT ''::character varying NOT NULL,
    menu_type smallint NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    rule character varying(100) DEFAULT ''::character varying NOT NULL,
    order_num smallint DEFAULT 0 NOT NULL,
    path character varying(500) DEFAULT ''::character varying NOT NULL,
    is_link smallint DEFAULT 0 NOT NULL,
    component character varying(500) DEFAULT ''::character varying NOT NULL,
    hide_menu smallint DEFAULT 0 NOT NULL,
    cache smallint DEFAULT 0 NOT NULL,
    icon character varying(50) DEFAULT ''::character varying NOT NULL,
    affix smallint DEFAULT 0 NOT NULL,
    always_show smallint DEFAULT 0 NOT NULL,
    breadcrumb smallint DEFAULT 1 NOT NULL,
    parent_id character varying(100),
    "left" bigint,
    "right" bigint,
    lock_version character varying(100) DEFAULT ''::character varying NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20)
);


--
-- TOC entry 3489 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE system_menu; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE system_menu IS '菜单表';


--
-- TOC entry 3490 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.title; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.title IS '菜单名称';


--
-- TOC entry 3491 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.menu_type; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.menu_type IS '类型:1=目录;2=菜单;3=按钮';


--
-- TOC entry 3492 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.status; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.status IS '状态:1=启用;0=禁用';


--
-- TOC entry 3493 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.rule; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.rule IS '权限';


--
-- TOC entry 3494 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.order_num; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.order_num IS '排序(降序)';


--
-- TOC entry 3495 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.path; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.path IS '路径';


--
-- TOC entry 3496 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.is_link; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.is_link IS '外链:1=是;0=否';


--
-- TOC entry 3497 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.component; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.component IS '组件路径(相对于views文件夹)';


--
-- TOC entry 3498 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.hide_menu; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.hide_menu IS '隐藏:1=是;0=否';


--
-- TOC entry 3499 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.cache; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.cache IS '缓存:1=是;0=否';


--
-- TOC entry 3500 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.icon; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.icon IS '图标';


--
-- TOC entry 3501 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.affix; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.affix IS '固定tag:1=是;0=否';


--
-- TOC entry 3502 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.always_show; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.always_show IS '恒定展示(只有一个子元素时不隐藏):1=是;0=否';


--
-- TOC entry 3503 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.breadcrumb; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.breadcrumb IS '面包屑:1=展示;0=不展示';


--
-- TOC entry 3504 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.parent_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.parent_id IS '父级id';


--
-- TOC entry 3505 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu."left"; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu."left" IS '左树边界';


--
-- TOC entry 3506 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu."right"; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu."right" IS '右树边界';


--
-- TOC entry 3507 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.lock_version; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.lock_version IS '锁版本号';


--
-- TOC entry 3508 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.created_at IS '创建时间';


--
-- TOC entry 3509 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.updated_at IS '最后更新时间';


--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3511 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN system_menu.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_menu.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 237 (class 1259 OID 27912)
-- Name: system_role; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE system_role (
    id character varying(20) NOT NULL,
    role_name character varying(50) DEFAULT ''::character varying NOT NULL,
    role_key character varying(50) DEFAULT ''::character varying NOT NULL,
    order_num smallint DEFAULT 0 NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    remark character varying(100) DEFAULT ''::character varying NOT NULL,
    parent_id character varying(100),
    "left" bigint,
    "right" bigint,
    lock_version character varying(100) DEFAULT ''::character varying NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20),
    is_super smallint DEFAULT 0 NOT NULL
);


--
-- TOC entry 3512 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE system_role; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE system_role IS '角色表';


--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.role_name; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.role_name IS '角色名称';


--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.role_key; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.role_key IS '角色标识';


--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.order_num; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.order_num IS '排序(降序)';


--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.status; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.status IS '状态:1=启用;0=禁用';


--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.remark; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.remark IS '备注';


--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.parent_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.parent_id IS '父级id';


--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role."left"; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role."left" IS '左树边界';


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role."right"; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role."right" IS '右树边界';


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.lock_version; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.lock_version IS '锁版本号';


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.created_at IS '创建时间';


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.updated_at IS '最后更新时间';


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN system_role.is_super; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN system_role.is_super IS '超级管理员:1=是;0=不是';


--
-- TOC entry 238 (class 1259 OID 27922)
-- Name: user; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE "user" (
    id character varying(20) NOT NULL,
    username character varying(50) DEFAULT ''::character varying NOT NULL,
    nickname character varying(20) DEFAULT ''::character varying NOT NULL,
    password character varying(64) DEFAULT ''::character varying NOT NULL,
    salt character varying(32) DEFAULT ''::character varying NOT NULL,
    avatar_file_id character varying(20),
    email character varying(100) DEFAULT NULL::character varying,
    mobile character varying(11) DEFAULT NULL::character varying,
    login_failure smallint DEFAULT 0 NOT NULL,
    last_login_at timestamp with time zone,
    last_login_ip character varying(50) DEFAULT ''::character varying NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    deleted_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_user_id character varying(20),
    updated_user_id character varying(20),
    created_admin_id character varying(20),
    updated_admin_id character varying(20)
);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE "user"; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE "user" IS '用户表';


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".username; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".username IS '用户名';


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".nickname; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".nickname IS '昵称';


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".password; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".password IS '密码';


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".salt; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".salt IS '密码盐';


--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".avatar_file_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".avatar_file_id IS '头像附件id';


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".email; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".email IS '邮箱';


--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".mobile; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".mobile IS '手机号';


--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".login_failure; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".login_failure IS '登录失败次数';


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".last_login_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".last_login_at IS '登录时间';


--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".last_login_ip; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".last_login_ip IS '登录ip';


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".status; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".status IS '状态:1=启用;0=禁用';


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".deleted_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".deleted_at IS '删除时间';


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".created_at IS '创建时间';


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".updated_at IS '最后更新时间';


--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".created_user_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".created_user_id IS '创建者(用户)Id';


--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".updated_user_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".updated_user_id IS '最后更新者(用户)Id';


--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN "user".updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN "user".updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 239 (class 1259 OID 27934)
-- Name: user_file; Type: TABLE; Schema: meadmin; Owner: -
--

CREATE TABLE user_file (
    id character varying(20) NOT NULL,
    name character varying(300) DEFAULT ''::character varying NOT NULL,
    path character varying(200) DEFAULT ''::character varying NOT NULL,
    mime_type character varying(50) DEFAULT ''::character varying NOT NULL,
    size integer,
    storage character varying(50) DEFAULT 'storage'::character varying NOT NULL,
    md5 character varying(32) DEFAULT ''::character varying NOT NULL,
    created_user_id character varying(20),
    updated_user_id character varying(20),
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_admin_id character varying(20),
    updated_admin_id character varying(20)
);


--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE user_file; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON TABLE user_file IS '用户附件表(前台)';


--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.name; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.name IS '文件名';


--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.path; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.path IS '路径';


--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.mime_type; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.mime_type IS 'mime类型';


--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.size; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.size IS '文件大小(b)';


--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.storage; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.storage IS '存储引擎';


--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.md5; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.md5 IS '文件MD5值';


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.created_user_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.created_user_id IS '创建者(用户)Id';


--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.updated_user_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.updated_user_id IS '最后更新者(用户)Id';


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.created_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.created_at IS '创建时间';


--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.updated_at; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.updated_at IS '最后更新时间';


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.created_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.created_admin_id IS '创建者(管理员)Id';


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN user_file.updated_admin_id; Type: COMMENT; Schema: meadmin; Owner: -
--

COMMENT ON COLUMN user_file.updated_admin_id IS '最后更新者(管理员)Id';


--
-- TOC entry 3427 (class 0 OID 27852)
-- Dependencies: 230
-- Data for Name: admin_role; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY admin_role (system_role_id, system_admin_id) FROM stdin;
635392868638261248	604612615536115712
635419305097297920	632899190933946368
635419444721483776	632899190933946368
\.


--
-- TOC entry 3437 (class 0 OID 28100)
-- Dependencies: 240
-- Data for Name: example_book; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY example_book (id, name, created_admin_id, updated_admin_id, created_at, updated_at) FROM stdin;
1	平凡的世界	604612615536115712	604612615536115712	2026-01-08 15:16:13+08	2026-01-08 15:16:17+08
2	钢铁是怎样练成的	604612615536115712	604612615536115712	2026-01-08 15:17:01+08	2026-01-08 15:17:04+08
3	基督山伯爵	604612615536115712	604612615536115712	2026-01-08 15:17:23+08	2026-01-08 15:17:26+08
4	西游记	604612615536115712	604612615536115712	2026-01-08 15:17:44+08	2026-01-08 15:17:47+08
5	水浒传	604612615536115712	604612615536115712	2026-01-08 15:18:07+08	2026-01-08 15:18:09+08
6	红楼梦	604612615536115712	604612615536115712	2026-01-08 15:18:28+08	2026-01-08 15:18:30+08
7	三国演绎	604612615536115712	604612615536115712	2026-01-08 15:18:48+08	2026-01-08 15:18:51+08
\.


--
-- TOC entry 3428 (class 0 OID 27859)
-- Dependencies: 231
-- Data for Name: example_demo; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY example_demo (id, name, created_admin_id, updated_admin_id, created_at, updated_at, mobile, type, user_id, avatar_file_id, deleted_at) FROM stdin;
664043217833951232	测试	604612615536115712	604612615536115712	2026-01-07 17:50:40.459+08	2026-01-08 20:53:13.587+08	13333333333	0	657558079876890624	646151944066301952	\N
\.


--
-- TOC entry 3438 (class 0 OID 29477)
-- Dependencies: 241
-- Data for Name: example_demo_books; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY example_demo_books (example_book_id, example_demo_id) FROM stdin;
1	664043217833951232
\.


--
-- TOC entry 3429 (class 0 OID 27867)
-- Dependencies: 232
-- Data for Name: example_demo_files; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY example_demo_files (file_id, example_demo_id) FROM stdin;
639448903602667520	664043217833951232
644498186374742016	664043217833951232
640524238482046976	664043217833951232
646269163429429248	664043217833951232
646155434071162880	664043217833951232
639466180326719488	664043217833951232
664481511247970304	664043217833951232
\.


--
-- TOC entry 3430 (class 0 OID 27870)
-- Dependencies: 233
-- Data for Name: file; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY file (id, name, mime_type, size, storage, created_at, updated_at, created_admin_id, updated_admin_id, path, md5) FROM stdin;
677056935534526464	Krma0Tzl8b.jpg	image/jpeg	27667	local	2026-02-12 15:42:32.541+08	2026-02-12 15:42:32.541+08	604612615536115712	604612615536115712	a8aa632b76c334a6c6094b3818bb68a9.jpg	a8aa632b76c334a6c6094b3818bb68a9
677056968040382464	OIP-C.webp	image/webp	1768	local	2026-02-12 15:42:40.292+08	2026-02-12 15:42:40.292+08	604612615536115712	604612615536115712	c43cc289054dd01147070f8223c9cfa1.webp	c43cc289054dd01147070f8223c9cfa1
\.


--
-- TOC entry 3431 (class 0 OID 27880)
-- Dependencies: 234
-- Data for Name: role_menu; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY role_menu (system_menu_id, system_role_id) FROM stdin;
1	635419305097297920
2	635419305097297920
3	635419305097297920
3	635424437604188160
\.


--
-- TOC entry 3432 (class 0 OID 27883)
-- Dependencies: 235
-- Data for Name: system_admin; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY system_admin (id, username, nickname, password, salt, email, mobile, login_failure, last_login_at, last_login_ip, status, created_admin_id, updated_admin_id, deleted_at, created_at, updated_at, avatar_file_id) FROM stdin;
632899190933946368	Test	test	ec7cb37e4c73af64cd2fd5b7e844ae1b8931acb4b1ebe555f2f2eefe33c831fe	de80c6206e17adf184a36c7e0840f01f	\N	15555555555	0	\N		1	604612615536115712	604612615536115712	\N	2025-10-13 19:15:25.818+08	2026-02-12 15:42:33.751+08	677056935534526464
604612615536115712	admin	Admin	e8e51c59da6333bce7a443efc3e8e2e792ac6b5592a70523a16b074ba1dcc3c0	d06d09e00fbb3ed98f6ce1f004be912c	admin@outlock.com	13333333333	0	2026-03-31 16:13:06.435+08	::ffff:127.0.0.1	1	604612615536115712	604612615536115712	\N	2025-07-27 17:54:40.704+08	2026-03-31 16:13:06.435+08	677056968040382464
\.


--
-- TOC entry 3433 (class 0 OID 27893)
-- Dependencies: 236
-- Data for Name: system_menu; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY system_menu (id, title, menu_type, status, rule, order_num, path, is_link, component, hide_menu, cache, icon, affix, always_show, breadcrumb, parent_id, "left", "right", lock_version, created_at, updated_at, created_admin_id, updated_admin_id) FROM stdin;
664816035819421696	新增	3	1	user_file_add	97		0		0	0		0	0	1	664816034456272896	61	62		2026-01-09 21:01:34.624+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664816036259823616	编辑	3	1	user_file_edit	96		0		0	0		0	0	1	664816034456272896	63	64		2026-01-09 21:01:34.729+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664816034456272896	前台附件	2	1	user_file	998	user/file	0	user/file/index	0	0		0	0	1	664816340996980736	56	67		2026-01-09 21:01:34.3+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664813414475890688	用户管理	2	1	user	997	/user	0	user/index	0	0		0	0	1	\N	81	92		2026-01-09 20:51:09.647+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664813415100841984	列表	3	1	user_list	99		0		0	0		0	0	1	664813414475890688	82	83		2026-01-09 20:51:09.796+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664813415503495168	详情	3	1	user_info	98		0		0	0		0	0	1	664813414475890688	84	85		2026-01-09 20:51:09.892+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664813415910342656	新增	3	1	user_add	97		0		0	0		0	0	1	664813414475890688	86	87		2026-01-09 20:51:09.989+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664813416312995840	编辑	3	1	user_edit	96		0		0	0		0	0	1	664813414475890688	88	89		2026-01-09 20:51:10.085+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664813416715649024	删除	3	1	user_del	95		0		0	0		0	0	1	664813414475890688	90	91		2026-01-09 20:51:10.181+08	2026-01-16 18:32:59.102+08	\N	604612615536115712
664799640041816064	列表	3	1	system_role_list	99		0		0	1		0	0	1	664798918835437568	28	29		2026-01-09 19:56:25.566+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664799999699189760	编辑	3	1	system_role_edit	96		0		0	1		0	0	1	664798918835437568	34	35		2026-01-09 19:57:51.316+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664816034934423552	列表	3	1	user_file_list	99		0		0	0		0	0	1	664816034456272896	57	58		2026-01-09 21:01:34.413+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664816036704419840	删除	3	1	user_file_del	95		0		0	0		0	0	1	664816034456272896	65	66		2026-01-09 21:01:34.835+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664816035383214080	详情	3	1	user_file_info	98		0		0	0		0	0	1	664816034456272896	59	60		2026-01-09 21:01:34.52+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033966474395648	列表	3	1	example_demo_list	99		0		0	0		0	0	1	664033966046576640	43	44		2026-01-07 17:13:54.762+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033966889631744	详情	3	1	example_demo_info	98		0		0	0		0	0	1	664033966046576640	45	46		2026-01-07 17:13:54.862+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
639418081101217792	管理员附件	2	1	file	999	file	0	file/index	0	1		0	0	1	664816340996980736	68	79		2025-10-31 18:59:10.348+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664803191971381248	删除	3	1	file_del	95		0		0	1		0	0	1	639418081101217792	75	76		2026-01-09 20:10:32.412+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664802952766029824	编辑	3	1	file_edit	96		0		0	1		0	0	1	639418081101217792	77	78		2026-01-09 20:09:35.381+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664798399022759936	详情	3	1	system_admin_info	98		0		0	1		0	0	1	2	3	4		2026-01-09 19:51:29.684+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664799196632580096	菜单	3	1	system_menu	98		0		0	1		0	0	1	3	15	26		2026-01-09 19:54:39.849+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664802471784218624	列表	3	1	file_list	99		0		0	1		0	0	1	639418081101217792	69	70		2026-01-09 20:07:40.707+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664816340996980736	附件管理	1	1	file_manage	998	fileManage	0		0	1		0	0	1	\N	55	80		2026-01-09 21:02:47.384+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664797436325134336	新增	3	1	system_menu_add	97		0		0	1		0	0	1	664799196632580096	16	17		2026-01-09 19:47:40.16+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
1	系统设置	1	1	system	999	/system	0		0	0		0	0	1	\N	1	40		2025-07-31 15:20:29+08	2026-01-09 21:02:06.329+08	\N	604612615536115712
658270653836689408	新增	3	1	system_admin_add	97		0		0	1		0	0	1	2	7	8		2025-12-22 19:32:33.952+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
658270767712043008	编辑	3	1	system_admin_edit	96		0		0	1		0	0	1	2	9	10		2025-12-22 19:33:01.102+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664797552121479168	编辑	3	1	system_menu_edit	96		0		0	1		0	0	1	664799196632580096	22	23		2026-01-09 19:48:07.767+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
658270533162369024	列表	3	1	system_admin_list	99		0		0	1		0	0	1	2	5	6		2025-12-22 19:32:05.181+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
658270899723567104	删除	3	1	system_admin_del	95		0		0	1		0	0	1	2	11	12		2025-12-22 19:33:32.576+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664797875221299200	详情	3	1	system_menu_info	98		0		0	1		0	0	1	664799196632580096	20	21		2026-01-09 19:49:24.8+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664798918835437568	角色组	3	1	system_role	99		0		0	1		0	0	1	3	27	38		2026-01-09 19:53:33.617+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664797660825255936	删除	3	1	system_menu_del	95		0		0	1		0	0	1	664799196632580096	18	19		2026-01-09 19:48:33.684+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664797278774493184	列表	3	1	system_menu_list	99		0		0	1		0	0	1	664799196632580096	24	25		2026-01-09 19:47:02.598+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
3	菜单权限	2	1	system_menu_role	0	/system/menu	0	system/menuRole/index	0	0		0	0	1	1	14	39		2025-07-31 15:20:29+08	2026-01-09 21:02:06.329+08	\N	604612615536115712
664033967292284928	新增	3	1	example_demo_add	97		0		0	0		0	0	1	664033966046576640	47	48		2026-01-07 17:13:54.958+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033965581008896	示例	1	1	example	996	/example	0		0	0		0	1	1	\N	41	54		2026-01-07 17:13:54.549+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033968131145728	删除	3	1	example_demo_del	95		0		0	0		0	0	1	664033966046576640	49	50		2026-01-07 17:13:55.158+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033966046576640	Demo	2	1	example_demo	999	/example/demo	0	example/demo/index	0	0		0	0	1	664033965581008896	42	53		2026-01-07 17:13:54.66+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664033967724298240	编辑	3	1	example_demo_edit	96		0		0	0		0	0	1	664033966046576640	51	52		2026-01-07 17:13:55.06+08	2026-01-16 18:32:59.036+08	\N	604612615536115712
664803080839102464	新增	3	1	file_add	97		0		0	1		0	0	1	639418081101217792	73	74		2026-01-09 20:10:05.916+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664802570002235392	详情	3	1	file_info	98		0		0	1		0	0	1	639418081101217792	71	72		2026-01-09 20:08:04.123+08	2026-01-16 18:32:59.036+08	604612615536115712	604612615536115712
664800095295766528	删除	3	1	system_role_del	95		0		0	1		0	0	1	664798918835437568	36	37		2026-01-09 19:58:14.107+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
664799846128943104	新增	3	1	system_role_add	97		0		0	1		0	0	1	664798918835437568	32	33		2026-01-09 19:57:14.701+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
2	管理员	2	1	system_admin	99	/system/admin	0	system/admin/index	0	0		0	0	1	1	2	13		2025-07-31 15:20:29+08	2026-01-09 21:02:06.329+08	\N	604612615536115712
664799732303921152	详情	3	1	system_role_info	98		0		0	1		0	0	1	664798918835437568	30	31		2026-01-09 19:56:47.563+08	2026-01-09 21:02:06.329+08	604612615536115712	604612615536115712
\.


--
-- TOC entry 3434 (class 0 OID 27912)
-- Dependencies: 237
-- Data for Name: system_role; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY system_role (id, role_name, role_key, order_num, status, remark, parent_id, "left", "right", lock_version, created_at, updated_at, created_admin_id, updated_admin_id, is_super) FROM stdin;
635419444721483776	三级管理员2	three_admin3	997	1		635419154098159616	3	4		2025-10-20 18:10:01.144+08	2026-01-09 18:24:01.833+08	604612615536115712	604612615536115712	0
635419686065930240	三级管理员	three_admin	999	1		635419154098159616	5	6		2025-10-20 18:10:58.686+08	2026-01-09 18:24:01.833+08	604612615536115712	604612615536115712	0
635424437604188160	三级管理员1	three_admin1	0	1		635419154098159616	7	8		2025-10-20 18:29:51.54+08	2026-01-09 18:24:01.833+08	604612615536115712	604612615536115712	0
635419154098159616	二级管理员	tow_admin	999	1		635392868638261248	2	9		2025-10-20 18:08:51.855+08	2026-01-09 18:24:01.833+08	604612615536115712	604612615536115712	0
635392868638261248	超级管理员	super_admin	999	1			1	12		2025-10-20 16:24:24.912+08	2026-01-09 18:24:01.862+08	604612615536115712	604612615536115712	1
635419305097297920	二级管理员2	tow_admin2	998	1		635392868638261248	10	11		2025-10-20 18:09:27.855+08	2026-01-09 18:24:01.891+08	604612615536115712	604612615536115712	0
\.


--
-- TOC entry 3435 (class 0 OID 27922)
-- Dependencies: 238
-- Data for Name: user; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY "user" (id, username, nickname, password, salt, avatar_file_id, email, mobile, login_failure, last_login_at, last_login_ip, status, deleted_at, created_at, updated_at, created_user_id, updated_user_id, created_admin_id, updated_admin_id) FROM stdin;
657558079876890624	test	测试账户	0872954db1998fff1a92b4ff42f8f9aeb2932e67d0c7fb96e31dfa3db3504ec5	c10ebfb00d8075bb9045d74b3affc81e	676746940855091200	1111@qq.com	\N	0	\N		1	\N	2025-12-20 20:21:03.082+08	2026-01-02 17:23:59.702+08	\N	\N	\N	\N
\.


--
-- TOC entry 3436 (class 0 OID 27934)
-- Dependencies: 239
-- Data for Name: user_file; Type: TABLE DATA; Schema: meadmin; Owner: -
--

COPY user_file (id, name, path, mime_type, size, storage, md5, created_user_id, updated_user_id, created_at, updated_at, created_admin_id, updated_admin_id) FROM stdin;
676746940855091200	Krma0Tzl8b.jpg	a8aa632b76c334a6c6094b3818bb68a9.jpg	image/jpeg	27667	local	a8aa632b76c334a6c6094b3818bb68a9	\N	\N	2026-02-11 19:10:44.05+08	2026-02-11 19:10:44.05+08	604612615536115712	604612615536115712
\.


--
-- TOC entry 3280 (class 2606 OID 28105)
-- Name: example_book example_book_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY example_book
    ADD CONSTRAINT example_book_pkey PRIMARY KEY (id);


--
-- TOC entry 3282 (class 2606 OID 29481)
-- Name: example_demo_books example_demo_books_pkey1; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY example_demo_books
    ADD CONSTRAINT example_demo_books_pkey1 PRIMARY KEY (example_book_id, example_demo_id);


--
-- TOC entry 3255 (class 2606 OID 27950)
-- Name: example_demo_files example_demo_files_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY example_demo_files
    ADD CONSTRAINT example_demo_files_pkey PRIMARY KEY (file_id, example_demo_id);


--
-- TOC entry 3253 (class 2606 OID 27946)
-- Name: example_demo example_demo_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY example_demo
    ADD CONSTRAINT example_demo_pkey PRIMARY KEY (id);


--
-- TOC entry 3257 (class 2606 OID 27952)
-- Name: file file_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 27954)
-- Name: role_menu role_menu_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY role_menu
    ADD CONSTRAINT role_menu_pkey PRIMARY KEY (system_menu_id, system_role_id);


--
-- TOC entry 3263 (class 2606 OID 27959)
-- Name: system_admin system_admin_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY system_admin
    ADD CONSTRAINT system_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3267 (class 2606 OID 27963)
-- Name: system_menu system_menu_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY system_menu
    ADD CONSTRAINT system_menu_pkey PRIMARY KEY (id);


--
-- TOC entry 3270 (class 2606 OID 27966)
-- Name: system_role system_role_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY system_role
    ADD CONSTRAINT system_role_pkey PRIMARY KEY (id);


--
-- TOC entry 3278 (class 2606 OID 27973)
-- Name: user_file user_file_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY user_file
    ADD CONSTRAINT user_file_pkey PRIMARY KEY (id);


--
-- TOC entry 3275 (class 2606 OID 27971)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3251 (class 1259 OID 28516)
-- Name: example_demo_mobile_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX example_demo_mobile_unique ON example_demo USING btree (mobile) WHERE (NOT (deleted_at IS NULL));


--
-- TOC entry 3265 (class 1259 OID 28553)
-- Name: systemAdminRule; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX "systemAdminRule" ON system_menu USING btree (rule);


--
-- TOC entry 3260 (class 1259 OID 28545)
-- Name: system_admin_email_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX system_admin_email_unique ON system_admin USING btree (email) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3261 (class 1259 OID 28546)
-- Name: system_admin_mobile_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX system_admin_mobile_unique ON system_admin USING btree (mobile) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3264 (class 1259 OID 28544)
-- Name: system_admin_username_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX system_admin_username_unique ON system_admin USING btree (username) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3268 (class 1259 OID 28554)
-- Name: system_menu_rule_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX system_menu_rule_unique ON system_menu USING btree (rule);


--
-- TOC entry 3271 (class 1259 OID 28581)
-- Name: system_role_role_key_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX system_role_role_key_unique ON system_role USING btree (role_key);


--
-- TOC entry 3272 (class 1259 OID 28614)
-- Name: user_email_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX user_email_unique ON "user" USING btree (email) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3273 (class 1259 OID 28615)
-- Name: user_mobile_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX user_mobile_unique ON "user" USING btree (mobile) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3276 (class 1259 OID 28613)
-- Name: user_username_unique; Type: INDEX; Schema: meadmin; Owner: -
--

CREATE UNIQUE INDEX user_username_unique ON "user" USING btree (username) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 3283 (class 2606 OID 29482)
-- Name: example_demo_books example_demo_books_example_book_id_fkey1; Type: FK CONSTRAINT; Schema: meadmin; Owner: -
--

ALTER TABLE ONLY example_demo_books
    ADD CONSTRAINT example_demo_books_example_book_id_fkey1 FOREIGN KEY (example_book_id) REFERENCES example_book(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-03-31 22:14:23

--
-- PostgreSQL database dump complete
--

