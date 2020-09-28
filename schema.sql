-- https://en.wikipedia.org/wiki/Role-based_access_control
BEGIN;
CREATE EXTENSION citext;
CREATE TABLE subjects (
    id serial PRIMARY KEY,
    username citext
);
COMMENT ON TABLE subjects IS 'A person or automated agent';
CREATE TABLE roles (
    id serial PRIMARY KEY,
    org_id bigint NOT NULL REFERENCES subjects (id)
);
COMMENT ON TABLE roles IS 'Job function or title which defines an authority level';
CREATE TABLE permissions (
    id serial PRIMARY KEY,
    name citext
);
COMMENT ON TABLE permissions IS 'An approval of a mode of access to a resource';
CREATE TABLE permission_assignment (
    perm_id bigint NOT NULL REFERENCES permissions (id),
    role_id bigint NOT NULL REFERENCES roles (id),
    PRIMARY KEY (perm_id, role_id)
);
COMMENT ON TABLE permission_assignment IS 'Permission Assignment';
CREATE TABLE subject_assignment (
    subj_id bigint NOT NULL REFERENCES subjects (id),
    role_id bigint NOT NULL REFERENCES roles (id),
    PRIMARY KEY (subj_id, role_id)
);
COMMENT ON TABLE subject_assignment IS 'Subject Assignment';
COMMIT;

