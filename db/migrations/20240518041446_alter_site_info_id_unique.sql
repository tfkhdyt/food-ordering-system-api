-- migrate:up
ALTER TABLE site_informations ADD CONSTRAINT uq_site_info_user_id UNIQUE(user_id);

-- migrate:down
ALTER TABLE site_informations DROP CONSTRAINT uq_site_info_user_id;

