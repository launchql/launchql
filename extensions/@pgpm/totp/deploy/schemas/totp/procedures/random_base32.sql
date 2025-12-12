-- Uses pgcrypto's gen_random_bytes for cryptographically secure randomness; random() is not suitable for secrets. Preserves RFC 4648 base32 alphabet output.

-- Deploy schemas/totp/procedures/random_base32 to pg
-- requires: schemas/totp/schema

BEGIN;

CREATE FUNCTION totp.random_base32 (_length int DEFAULT 20)
  RETURNS text
  LANGUAGE sql
  AS $$
  SELECT
    string_agg(
      ('{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,2,3,4,5,6,7}'::text[])
      [ (get_byte(b, i) % 32) + 1 ],
      ''
    )
  FROM (SELECT gen_random_bytes(_length) AS b) t,
       LATERAL generate_series(0, _length - 1) g(i);
$$;

CREATE FUNCTION totp.generate_secret(hash TEXT DEFAULT 'sha1') RETURNS BYTEA AS $$
BEGIN
    -- See https://tools.ietf.org/html/rfc4868#section-2.1.2
    -- The optimal key length for HMAC is the block size of the algorithm
    CASE
          WHEN hash = 'sha1'   THEN RETURN totp.random_base32(20); -- = 160 bits
          WHEN hash = 'sha256' THEN RETURN totp.random_base32(32); -- = 256 bits
          WHEN hash = 'sha512' THEN RETURN totp.random_base32(64); -- = 512 bits
          ELSE
            RAISE EXCEPTION 'Unsupported hash algorithm for OTP (see RFC6238/4226).';
            RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMIT;

