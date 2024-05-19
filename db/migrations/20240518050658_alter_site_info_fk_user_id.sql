-- migrate:up
ALTER TABLE site_informations ADD CONSTRAINT fk_site_info_user_id 
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE site_informations DROP CONSTRAINT fk_site_info_user_id;
