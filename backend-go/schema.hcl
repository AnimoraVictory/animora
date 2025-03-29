table "audit_log_entries" {
  schema  = schema.auth
  comment = "Auth: Audit trail for user actions."
  column "instance_id" {
    null = true
    type = uuid
  }
  column "id" {
    null = false
    type = uuid
  }
  column "payload" {
    null = true
    type = json
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "ip_address" {
    null    = false
    type    = character_varying(64)
    default = ""
  }
  primary_key {
    columns = [column.id]
  }
  index "audit_logs_instance_id_idx" {
    columns = [column.instance_id]
  }
}
table "flow_state" {
  schema  = schema.auth
  comment = "stores metadata for pkce logins"
  column "id" {
    null = false
    type = uuid
  }
  column "user_id" {
    null = true
    type = uuid
  }
  column "auth_code" {
    null = false
    type = text
  }
  column "code_challenge_method" {
    null = false
    type = enum.code_challenge_method
  }
  column "code_challenge" {
    null = false
    type = text
  }
  column "provider_type" {
    null = false
    type = text
  }
  column "provider_access_token" {
    null = true
    type = text
  }
  column "provider_refresh_token" {
    null = true
    type = text
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "authentication_method" {
    null = false
    type = text
  }
  column "auth_code_issued_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  index "flow_state_created_at_idx" {
    on {
      desc   = true
      column = column.created_at
    }
  }
  index "idx_auth_code" {
    columns = [column.auth_code]
  }
  index "idx_user_id_auth_method" {
    columns = [column.user_id, column.authentication_method]
  }
}
table "identities" {
  schema  = schema.auth
  comment = "Auth: Stores identities associated to a user."
  column "provider_id" {
    null = false
    type = text
  }
  column "user_id" {
    null = false
    type = uuid
  }
  column "identity_data" {
    null = false
    type = jsonb
  }
  column "provider" {
    null = false
    type = text
  }
  column "last_sign_in_at" {
    null = true
    type = timestamptz
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "email" {
    null    = true
    type    = text
    comment = "Auth: Email is a generated column that references the optional email property in the identity_data"
    as {
      expr = "lower((identity_data ->> 'email'::text))"
      type = STORED
    }
  }
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "identities_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.auth.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "identities_email_idx" {
    comment = "Auth: Ensures indexed queries on the email column"
    on {
      column = column.email
      ops    = text_pattern_ops
    }
  }
  index "identities_user_id_idx" {
    columns = [column.user_id]
  }
  unique "identities_provider_id_provider_unique" {
    columns = [column.provider_id, column.provider]
  }
}
table "instances" {
  schema  = schema.auth
  comment = "Auth: Manages users across multiple sites."
  column "id" {
    null = false
    type = uuid
  }
  column "uuid" {
    null = true
    type = uuid
  }
  column "raw_base_config" {
    null = true
    type = text
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
}
table "mfa_amr_claims" {
  schema  = schema.auth
  comment = "auth: stores authenticator method reference claims for multi factor authentication"
  column "session_id" {
    null = false
    type = uuid
  }
  column "created_at" {
    null = false
    type = timestamptz
  }
  column "updated_at" {
    null = false
    type = timestamptz
  }
  column "authentication_method" {
    null = false
    type = text
  }
  column "id" {
    null = false
    type = uuid
  }
  primary_key "amr_id_pk" {
    columns = [column.id]
  }
  foreign_key "mfa_amr_claims_session_id_fkey" {
    columns     = [column.session_id]
    ref_columns = [table.sessions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  unique "mfa_amr_claims_session_id_authentication_method_pkey" {
    columns = [column.session_id, column.authentication_method]
  }
}
table "mfa_challenges" {
  schema  = schema.auth
  comment = "auth: stores metadata about challenge requests made"
  column "id" {
    null = false
    type = uuid
  }
  column "factor_id" {
    null = false
    type = uuid
  }
  column "created_at" {
    null = false
    type = timestamptz
  }
  column "verified_at" {
    null = true
    type = timestamptz
  }
  column "ip_address" {
    null = false
    type = inet
  }
  column "otp_code" {
    null = true
    type = text
  }
  column "web_authn_session_data" {
    null = true
    type = jsonb
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "mfa_challenges_auth_factor_id_fkey" {
    columns     = [column.factor_id]
    ref_columns = [table.mfa_factors.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "mfa_challenge_created_at_idx" {
    on {
      desc   = true
      column = column.created_at
    }
  }
}
table "mfa_factors" {
  schema  = schema.auth
  comment = "auth: stores metadata about factors"
  column "id" {
    null = false
    type = uuid
  }
  column "user_id" {
    null = false
    type = uuid
  }
  column "friendly_name" {
    null = true
    type = text
  }
  column "factor_type" {
    null = false
    type = enum.factor_type
  }
  column "status" {
    null = false
    type = enum.factor_status
  }
  column "created_at" {
    null = false
    type = timestamptz
  }
  column "updated_at" {
    null = false
    type = timestamptz
  }
  column "secret" {
    null = true
    type = text
  }
  column "phone" {
    null = true
    type = text
  }
  column "last_challenged_at" {
    null = true
    type = timestamptz
  }
  column "web_authn_credential" {
    null = true
    type = jsonb
  }
  column "web_authn_aaguid" {
    null = true
    type = uuid
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "mfa_factors_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.auth.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "factor_id_created_at_idx" {
    columns = [column.user_id, column.created_at]
  }
  index "mfa_factors_user_friendly_name_unique" {
    unique  = true
    columns = [column.friendly_name, column.user_id]
    where   = "(TRIM(BOTH FROM friendly_name) <> ''::text)"
  }
  index "mfa_factors_user_id_idx" {
    columns = [column.user_id]
  }
  index "unique_phone_factor_per_user" {
    unique  = true
    columns = [column.user_id, column.phone]
  }
  unique "mfa_factors_last_challenged_at_key" {
    columns = [column.last_challenged_at]
  }
}
table "one_time_tokens" {
  schema = schema.auth
  column "id" {
    null = false
    type = uuid
  }
  column "user_id" {
    null = false
    type = uuid
  }
  column "token_type" {
    null = false
    type = enum.one_time_token_type
  }
  column "token_hash" {
    null = false
    type = text
  }
  column "relates_to" {
    null = false
    type = text
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("now()")
  }
  column "updated_at" {
    null    = false
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "one_time_tokens_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.auth.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "one_time_tokens_relates_to_hash_idx" {
    columns = [column.relates_to]
    type    = HASH
  }
  index "one_time_tokens_token_hash_hash_idx" {
    columns = [column.token_hash]
    type    = HASH
  }
  index "one_time_tokens_user_id_token_type_key" {
    unique  = true
    columns = [column.user_id, column.token_type]
  }
  check "one_time_tokens_token_hash_check" {
    expr = "(char_length(token_hash) > 0)"
  }
}
table "refresh_tokens" {
  schema  = schema.auth
  comment = "Auth: Store of tokens used to refresh JWT tokens once they expire."
  column "instance_id" {
    null = true
    type = uuid
  }
  column "id" {
    null = false
    type = bigserial
  }
  column "token" {
    null = true
    type = character_varying(255)
  }
  column "user_id" {
    null = true
    type = character_varying(255)
  }
  column "revoked" {
    null = true
    type = boolean
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "parent" {
    null = true
    type = character_varying(255)
  }
  column "session_id" {
    null = true
    type = uuid
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "refresh_tokens_session_id_fkey" {
    columns     = [column.session_id]
    ref_columns = [table.sessions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "refresh_tokens_instance_id_idx" {
    columns = [column.instance_id]
  }
  index "refresh_tokens_instance_id_user_id_idx" {
    columns = [column.instance_id, column.user_id]
  }
  index "refresh_tokens_parent_idx" {
    columns = [column.parent]
  }
  index "refresh_tokens_session_id_revoked_idx" {
    columns = [column.session_id, column.revoked]
  }
  index "refresh_tokens_updated_at_idx" {
    on {
      desc   = true
      column = column.updated_at
    }
  }
  unique "refresh_tokens_token_unique" {
    columns = [column.token]
  }
}
table "saml_providers" {
  schema  = schema.auth
  comment = "Auth: Manages SAML Identity Provider connections."
  column "id" {
    null = false
    type = uuid
  }
  column "sso_provider_id" {
    null = false
    type = uuid
  }
  column "entity_id" {
    null = false
    type = text
  }
  column "metadata_xml" {
    null = false
    type = text
  }
  column "metadata_url" {
    null = true
    type = text
  }
  column "attribute_mapping" {
    null = true
    type = jsonb
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "name_id_format" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "saml_providers_sso_provider_id_fkey" {
    columns     = [column.sso_provider_id]
    ref_columns = [table.sso_providers.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "saml_providers_sso_provider_id_idx" {
    columns = [column.sso_provider_id]
  }
  check "entity_id not empty" {
    expr = "(char_length(entity_id) > 0)"
  }
  check "metadata_url not empty" {
    expr = "((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))"
  }
  check "metadata_xml not empty" {
    expr = "(char_length(metadata_xml) > 0)"
  }
  unique "saml_providers_entity_id_key" {
    columns = [column.entity_id]
  }
}
table "saml_relay_states" {
  schema  = schema.auth
  comment = "Auth: Contains SAML Relay State information for each Service Provider initiated login."
  column "id" {
    null = false
    type = uuid
  }
  column "sso_provider_id" {
    null = false
    type = uuid
  }
  column "request_id" {
    null = false
    type = text
  }
  column "for_email" {
    null = true
    type = text
  }
  column "redirect_to" {
    null = true
    type = text
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "flow_state_id" {
    null = true
    type = uuid
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "saml_relay_states_flow_state_id_fkey" {
    columns     = [column.flow_state_id]
    ref_columns = [table.flow_state.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "saml_relay_states_sso_provider_id_fkey" {
    columns     = [column.sso_provider_id]
    ref_columns = [table.sso_providers.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "saml_relay_states_created_at_idx" {
    on {
      desc   = true
      column = column.created_at
    }
  }
  index "saml_relay_states_for_email_idx" {
    columns = [column.for_email]
  }
  index "saml_relay_states_sso_provider_id_idx" {
    columns = [column.sso_provider_id]
  }
  check "request_id not empty" {
    expr = "(char_length(request_id) > 0)"
  }
}
table "auth" "schema_migrations" {
  schema  = schema.auth
  comment = "Auth: Manages updates to the auth system."
  column "version" {
    null = false
    type = character_varying(255)
  }
  primary_key {
    columns = [column.version]
  }
}
table "sessions" {
  schema  = schema.auth
  comment = "Auth: Stores session data associated to a user."
  column "id" {
    null = false
    type = uuid
  }
  column "user_id" {
    null = false
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "factor_id" {
    null = true
    type = uuid
  }
  column "aal" {
    null = true
    type = enum.aal_level
  }
  column "not_after" {
    null    = true
    type    = timestamptz
    comment = "Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired."
  }
  column "refreshed_at" {
    null = true
    type = timestamp
  }
  column "user_agent" {
    null = true
    type = text
  }
  column "ip" {
    null = true
    type = inet
  }
  column "tag" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "sessions_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.auth.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "sessions_not_after_idx" {
    on {
      desc   = true
      column = column.not_after
    }
  }
  index "sessions_user_id_idx" {
    columns = [column.user_id]
  }
  index "user_id_created_at_idx" {
    columns = [column.user_id, column.created_at]
  }
}
table "sso_domains" {
  schema  = schema.auth
  comment = "Auth: Manages SSO email address domain mapping to an SSO Identity Provider."
  column "id" {
    null = false
    type = uuid
  }
  column "sso_provider_id" {
    null = false
    type = uuid
  }
  column "domain" {
    null = false
    type = text
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "sso_domains_sso_provider_id_fkey" {
    columns     = [column.sso_provider_id]
    ref_columns = [table.sso_providers.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "sso_domains_domain_idx" {
    unique = true
    on {
      expr = "lower(domain)"
    }
  }
  index "sso_domains_sso_provider_id_idx" {
    columns = [column.sso_provider_id]
  }
  check "domain not empty" {
    expr = "(char_length(domain) > 0)"
  }
}
table "sso_providers" {
  schema  = schema.auth
  comment = "Auth: Manages SSO identity provider information; see saml_providers for SAML."
  column "id" {
    null = false
    type = uuid
  }
  column "resource_id" {
    null    = true
    type    = text
    comment = "Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code."
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  index "sso_providers_resource_id_idx" {
    unique = true
    on {
      expr = "lower(resource_id)"
    }
  }
  check "resource_id not empty" {
    expr = "((resource_id = NULL::text) OR (char_length(resource_id) > 0))"
  }
}
table "auth" "users" {
  schema  = schema.auth
  comment = "Auth: Stores user login data within a secure schema."
  column "instance_id" {
    null = true
    type = uuid
  }
  column "id" {
    null = false
    type = uuid
  }
  column "aud" {
    null = true
    type = character_varying(255)
  }
  column "role" {
    null = true
    type = character_varying(255)
  }
  column "email" {
    null = true
    type = character_varying(255)
  }
  column "encrypted_password" {
    null = true
    type = character_varying(255)
  }
  column "email_confirmed_at" {
    null = true
    type = timestamptz
  }
  column "invited_at" {
    null = true
    type = timestamptz
  }
  column "confirmation_token" {
    null = true
    type = character_varying(255)
  }
  column "confirmation_sent_at" {
    null = true
    type = timestamptz
  }
  column "recovery_token" {
    null = true
    type = character_varying(255)
  }
  column "recovery_sent_at" {
    null = true
    type = timestamptz
  }
  column "email_change_token_new" {
    null = true
    type = character_varying(255)
  }
  column "email_change" {
    null = true
    type = character_varying(255)
  }
  column "email_change_sent_at" {
    null = true
    type = timestamptz
  }
  column "last_sign_in_at" {
    null = true
    type = timestamptz
  }
  column "raw_app_meta_data" {
    null = true
    type = jsonb
  }
  column "raw_user_meta_data" {
    null = true
    type = jsonb
  }
  column "is_super_admin" {
    null = true
    type = boolean
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "updated_at" {
    null = true
    type = timestamptz
  }
  column "phone" {
    null    = true
    type    = text
    default = sql("NULL::character varying")
  }
  column "phone_confirmed_at" {
    null = true
    type = timestamptz
  }
  column "phone_change" {
    null    = true
    type    = text
    default = ""
  }
  column "phone_change_token" {
    null    = true
    type    = character_varying(255)
    default = ""
  }
  column "phone_change_sent_at" {
    null = true
    type = timestamptz
  }
  column "confirmed_at" {
    null = true
    type = timestamptz
    as {
      expr = "LEAST(email_confirmed_at, phone_confirmed_at)"
      type = STORED
    }
  }
  column "email_change_token_current" {
    null    = true
    type    = character_varying(255)
    default = ""
  }
  column "email_change_confirm_status" {
    null    = true
    type    = smallint
    default = 0
  }
  column "banned_until" {
    null = true
    type = timestamptz
  }
  column "reauthentication_token" {
    null    = true
    type    = character_varying(255)
    default = ""
  }
  column "reauthentication_sent_at" {
    null = true
    type = timestamptz
  }
  column "is_sso_user" {
    null    = false
    type    = boolean
    default = false
    comment = "Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails."
  }
  column "deleted_at" {
    null = true
    type = timestamptz
  }
  column "is_anonymous" {
    null    = false
    type    = boolean
    default = false
  }
  primary_key {
    columns = [column.id]
  }
  index "confirmation_token_idx" {
    unique  = true
    columns = [column.confirmation_token]
    where   = "((confirmation_token)::text !~ '^[0-9 ]*$'::text)"
  }
  index "email_change_token_current_idx" {
    unique  = true
    columns = [column.email_change_token_current]
    where   = "((email_change_token_current)::text !~ '^[0-9 ]*$'::text)"
  }
  index "email_change_token_new_idx" {
    unique  = true
    columns = [column.email_change_token_new]
    where   = "((email_change_token_new)::text !~ '^[0-9 ]*$'::text)"
  }
  index "reauthentication_token_idx" {
    unique  = true
    columns = [column.reauthentication_token]
    where   = "((reauthentication_token)::text !~ '^[0-9 ]*$'::text)"
  }
  index "recovery_token_idx" {
    unique  = true
    columns = [column.recovery_token]
    where   = "((recovery_token)::text !~ '^[0-9 ]*$'::text)"
  }
  index "users_email_partial_key" {
    unique  = true
    columns = [column.email]
    comment = "Auth: A partial unique index that applies only when is_sso_user is false"
    where   = "(is_sso_user = false)"
  }
  index "users_instance_id_email_idx" {
    on {
      column = column.instance_id
    }
    on {
      expr = "lower((email)::text)"
    }
  }
  index "users_instance_id_idx" {
    columns = [column.instance_id]
  }
  index "users_is_anonymous_idx" {
    columns = [column.is_anonymous]
  }
  check "users_email_change_confirm_status_check" {
    expr = "((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2))"
  }
  unique "users_phone_key" {
    columns = [column.phone]
  }
}
table "comments" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "content" {
    null = true
    type = text
  }
  column "post_id" {
    null = true
    type = uuid
  }
  column "user_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "fk_posts_comments" {
    columns     = [column.post_id]
    ref_columns = [table.posts.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_users_comments" {
    columns     = [column.user_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
}
table "follow_relations" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "from_id" {
    null = true
    type = uuid
  }
  column "to_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "fk_follow_relations_followed" {
    columns     = [column.to_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "fk_follow_relations_follower" {
    columns     = [column.from_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_fromId_toId" {
    unique  = true
    columns = [column.from_id, column.to_id]
  }
}
table "likes" {
  schema = schema.public
  column "id" {
    null = false
    type = bigserial
  }
  column "post_id" {
    null = true
    type = uuid
  }
  column "user_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "fk_posts_likes" {
    columns     = [column.post_id]
    ref_columns = [table.posts.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_users_likes" {
    columns     = [column.user_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
}
table "pets" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "name" {
    null = true
    type = text
  }
  column "birth_day" {
    null = true
    type = text
  }
  column "image_key" {
    null = true
    type = text
  }
  column "owner_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "deleted_at" {
    null = true
    type = timestamptz
  }
  column "type" {
    null = true
    type = enum.pet_type
  }
  column "species" {
    null = true
    type = enum.pet_species
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "fk_users_pets" {
    columns     = [column.owner_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
}
table "posts" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "caption" {
    null = true
    type = text
  }
  column "image_key" {
    null = true
    type = text
  }
  column "user_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  column "deleted_at" {
    null = true
    type = timestamptz
  }
  column "text_feature" {
    null = true
    type = sql("public.vector(768)")
  }
  column "image_feature" {
    null = true
    type = sql("public.vector(768)")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "fk_users_posts" {
    columns     = [column.user_id]
    ref_columns = [table.public.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
}
table "public" "users" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "email" {
    null = true
    type = text
  }
  column "name" {
    null = true
    type = text
  }
  column "bio" {
    null = true
    type = text
  }
  column "icon_image_key" {
    null = true
    type = text
  }
  column "created_at" {
    null = true
    type = timestamptz
  }
  primary_key {
    columns = [column.id]
  }
  unique "uni_users_email" {
    columns = [column.email]
  }
}
table "messages" {
  schema = schema.realtime
  column "topic" {
    null = false
    type = text
  }
  column "extension" {
    null = false
    type = text
  }
  column "payload" {
    null = true
    type = jsonb
  }
  column "event" {
    null = true
    type = text
  }
  column "private" {
    null    = true
    type    = boolean
    default = false
  }
  column "updated_at" {
    null    = false
    type    = timestamp
    default = sql("now()")
  }
  column "inserted_at" {
    null    = false
    type    = timestamp
    default = sql("now()")
  }
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  primary_key {
    columns = [column.id, column.inserted_at]
  }
  partition {
    type    = RANGE
    columns = [column.inserted_at]
  }
}
table "realtime" "schema_migrations" {
  schema = schema.realtime
  column "version" {
    null = false
    type = bigint
  }
  column "inserted_at" {
    null = true
    type = timestamp(0)
  }
  primary_key {
    columns = [column.version]
  }
}
table "subscription" {
  schema = schema.realtime
  column "id" {
    null = false
    type = bigint
    identity {
      generated = ALWAYS
    }
  }
  column "subscription_id" {
    null = false
    type = uuid
  }
  column "entity" {
    null = false
    type = regclass
  }
  column "filters" {
    null    = false
    type    = sql("realtime.user_defined_filter[]")
    default = "{}"
  }
  column "claims" {
    null = false
    type = jsonb
  }
  column "claims_role" {
    null = false
    type = regrole
    as {
      expr = "realtime.to_regrole((claims ->> 'role'::text))"
      type = STORED
    }
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("timezone('utc'::text, now())")
  }
  primary_key "pk_subscription" {
    columns = [column.id]
  }
  index "ix_realtime_subscription_entity" {
    columns = [column.entity]
  }
  index "subscription_subscription_id_entity_filters_key" {
    unique  = true
    columns = [column.subscription_id, column.entity, column.filters]
  }
}
table "buckets" {
  schema = schema.storage
  column "id" {
    null = false
    type = text
  }
  column "name" {
    null = false
    type = text
  }
  column "owner" {
    null    = true
    type    = uuid
    comment = "Field is deprecated, use owner_id instead"
  }
  column "created_at" {
    null    = true
    type    = timestamptz
    default = sql("now()")
  }
  column "updated_at" {
    null    = true
    type    = timestamptz
    default = sql("now()")
  }
  column "public" {
    null    = true
    type    = boolean
    default = false
  }
  column "avif_autodetection" {
    null    = true
    type    = boolean
    default = false
  }
  column "file_size_limit" {
    null = true
    type = bigint
  }
  column "allowed_mime_types" {
    null = true
    type = sql("text[]")
  }
  column "owner_id" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  index "bname" {
    unique  = true
    columns = [column.name]
  }
}
table "migrations" {
  schema = schema.storage
  column "id" {
    null = false
    type = integer
  }
  column "name" {
    null = false
    type = character_varying(100)
  }
  column "hash" {
    null = false
    type = character_varying(40)
  }
  column "executed_at" {
    null    = true
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.id]
  }
  unique "migrations_name_key" {
    columns = [column.name]
  }
}
table "objects" {
  schema = schema.storage
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "bucket_id" {
    null = true
    type = text
  }
  column "name" {
    null = true
    type = text
  }
  column "owner" {
    null    = true
    type    = uuid
    comment = "Field is deprecated, use owner_id instead"
  }
  column "created_at" {
    null    = true
    type    = timestamptz
    default = sql("now()")
  }
  column "updated_at" {
    null    = true
    type    = timestamptz
    default = sql("now()")
  }
  column "last_accessed_at" {
    null    = true
    type    = timestamptz
    default = sql("now()")
  }
  column "metadata" {
    null = true
    type = jsonb
  }
  column "path_tokens" {
    null = true
    type = sql("text[]")
    as {
      expr = "string_to_array(name, '/'::text)"
      type = STORED
    }
  }
  column "version" {
    null = true
    type = text
  }
  column "owner_id" {
    null = true
    type = text
  }
  column "user_metadata" {
    null = true
    type = jsonb
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "objects_bucketId_fkey" {
    columns     = [column.bucket_id]
    ref_columns = [table.buckets.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "bucketid_objname" {
    unique  = true
    columns = [column.bucket_id, column.name]
  }
  index "idx_objects_bucket_id_name" {
    columns = [column.bucket_id, column.name]
  }
  index "name_prefix_search" {
    on {
      column = column.name
      ops    = text_pattern_ops
    }
  }
}
table "s3_multipart_uploads" {
  schema = schema.storage
  column "id" {
    null = false
    type = text
  }
  column "in_progress_size" {
    null    = false
    type    = bigint
    default = 0
  }
  column "upload_signature" {
    null = false
    type = text
  }
  column "bucket_id" {
    null = false
    type = text
  }
  column "key" {
    null    = false
    type    = text
    collate = "C"
  }
  column "version" {
    null = false
    type = text
  }
  column "owner_id" {
    null = true
    type = text
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  column "user_metadata" {
    null = true
    type = jsonb
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "s3_multipart_uploads_bucket_id_fkey" {
    columns     = [column.bucket_id]
    ref_columns = [table.buckets.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "idx_multipart_uploads_list" {
    columns = [column.bucket_id, column.key, column.created_at]
  }
}
table "s3_multipart_uploads_parts" {
  schema = schema.storage
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "upload_id" {
    null = false
    type = text
  }
  column "size" {
    null    = false
    type    = bigint
    default = 0
  }
  column "part_number" {
    null = false
    type = integer
  }
  column "bucket_id" {
    null = false
    type = text
  }
  column "key" {
    null    = false
    type    = text
    collate = "C"
  }
  column "etag" {
    null = false
    type = text
  }
  column "owner_id" {
    null = true
    type = text
  }
  column "version" {
    null = false
    type = text
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "s3_multipart_uploads_parts_bucket_id_fkey" {
    columns     = [column.bucket_id]
    ref_columns = [table.buckets.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "s3_multipart_uploads_parts_upload_id_fkey" {
    columns     = [column.upload_id]
    ref_columns = [table.s3_multipart_uploads.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
}
enum "factor_type" {
  schema = schema.auth
  values = ["totp", "webauthn", "phone"]
}
enum "factor_status" {
  schema = schema.auth
  values = ["unverified", "verified"]
}
enum "aal_level" {
  schema = schema.auth
  values = ["aal1", "aal2", "aal3"]
}
enum "code_challenge_method" {
  schema = schema.auth
  values = ["s256", "plain"]
}
enum "one_time_token_type" {
  schema = schema.auth
  values = ["confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token"]
}
enum "key_status" {
  schema = schema.pgsodium
  values = ["default", "valid", "invalid", "expired"]
}
enum "key_type" {
  schema = schema.pgsodium
  values = ["aead-ietf", "aead-det", "hmacsha512", "hmacsha256", "auth", "shorthash", "generichash", "kdf", "secretbox", "secretstream", "stream_xchacha20"]
}
enum "pet_type" {
  schema = schema.public
  values = ["dog", "cat"]
}
enum "pet_species" {
  schema = schema.public
  values = ["labrador", "poodle", "german_shepherd", "irish_wolfhound", "irish_setter", "afghan_hound", "american_cocker_spaniel", "american_staffordshire_terrier", "english_cocker_spaniel", "english_springer_spaniel", "west_highland_white_terrier", "welsh_corgi_pembroke", "airedale_terrier", "australian_shepherd", "kai_ken", "cavalier_king_charles_spaniel", "great_pyrenees", "keeshond", "cairn_terrier", "golden_retriever", "saluki", "shih_tzu", "shetland_sheepdog", "shiba_inu", "siberian_husky", "jack_russell_terrier", "scottish_terrier", "st_bernard", "dachshund", "dalmatian", "chinese_crested_dog", "chihuahua", "dogo_argentino", "doberman", "japanese_spitz", "bernese_mountain_dog", "pug", "basset_hound", "papillon", "bearded_collie", "beagle", "bichon_frise", "bouvier_des_flandres", "flat_coated_retriever", "bull_terrier", "bulldog", "french_bulldog", "pekinese", "bedlington_terrier", "belgian_tervuren", "border_collie", "boxer", "boston_terrier", "pomeranian", "borzoi", "maltese", "miniature_schnauzer", "miniature_pincher", "yorkshire_terrier", "rough_collie", "labrador_retriever", "rottweiler", "weimaraner", "american_curl", "american_shorthair", "egyptian_mau", "cornish_rex", "japanese_bobtail", "siamese", "singapura", "scottish_fold", "somali", "turkish_angora", "tonkinese", "norwegian_forest_cat", "burmilla", "british_shorthair", "household_pet", "persian", "bengal", "maine_coon", "munchkin", "ragdoll", "russian_blue"]
}
enum "equality_op" {
  schema = schema.realtime
  values = ["eq", "neq", "lt", "lte", "gt", "gte", "in"]
}
enum "action" {
  schema = schema.realtime
  values = ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"]
}
schema "auth" {
}
schema "extensions" {
}
schema "graphql" {
}
schema "graphql_public" {
}
schema "pgbouncer" {
}
schema "pgsodium" {
}
schema "public" {
  comment = "standard public schema"
}
schema "realtime" {
}
schema "storage" {
}
schema "vault" {
}
