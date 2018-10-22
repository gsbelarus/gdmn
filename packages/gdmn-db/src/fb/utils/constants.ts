export enum SQLTypes {
    SQL_TEXT = 452,
    SQL_VARYING = 448,
    SQL_SHORT = 500,
    SQL_LONG = 496,
    SQL_FLOAT = 482,
    SQL_DOUBLE = 480,
    // SQL_D_FLOAT = 530,
    SQL_TIMESTAMP = 510,
    SQL_BLOB = 520,
    // SQL_ARRAY = 540,
    // SQL_QUAD = 550,
    SQL_TYPE_TIME = 560,
    SQL_TYPE_DATE = 570,
    SQL_INT64 = 580,
    SQL_BOOLEAN = 32764,
    SQL_NULL = 32766
}

export enum SQL_BLOB_SUB_TYPE {
    BINARY = 0,
    TEXT = 1,
    BLR = 2
}

export enum blobInfo {
    totalLength = 6
}

export enum XpbBuilderParams {
    VERSION = 3,
    DPB = 1,
    SPB_ATTACH = 2,
    SPB_START = 3,
    TPB = 4,
    BATCH = 5,
    BPB = 6
}

/* Common, structural codes */
/****************************/
export enum isc_info {
    end = 1,
    truncated = 2,
    error = 3,
    data_not_ready = 4,
    length = 126,
    flag_end = 127
  }

  /**********************************/
  /* Database parameter block stuff */
  /**********************************/
export enum isc_dpb {
  version1 = 1,
  version2 = 2,
  cdd_pathname = 1,
  allocation = 2,
  journal = 3,
  page_size = 4,
  num_buffers = 5,
  buffer_length = 6,
  debug = 7,
  garbage_collect = 8,
  verify = 9,
  sweep = 10,
  enable_journal = 11,
  disable_journal = 12,
  dbkey_scope = 13,
  number_of_users = 14,
  trace = 15,
  no_garbage_collect = 16,
  damaged = 17,
  license = 18,
  sys_user_name = 19,
  encrypt_key = 20,
  activate_shadow = 21,
  sweep_interval = 22,
  delete_shadow = 23,
  force_write = 24,
  begin_log = 25,
  quit_log = 26,
  no_reserve = 27,
  user_name = 28,
  password = 29,
  password_enc = 30,
  sys_user_name_enc = 31,
  interp = 32,
  online_dump = 33,
  old_file_size = 34,
  old_num_files = 35,
  old_file = 36,
  old_start_page = 37,
  old_start_seqno = 38,
  old_start_file = 39,
  drop_walfile = 40,
  old_dump_id = 41,
  wal_backup_dir = 42,
  wal_chkptlen = 43,
  wal_numbufs = 44,
  wal_bufsize = 45,
  wal_grp_cmt_wait = 46,
  lc_messages = 47,
  lc_ctype = 48,
  cache_manager = 49,
  shutdown = 50,
  online = 51,
  shutdown_delay = 52,
  reserved = 53,
  overwrite = 54,
  sec_attach = 55,
  disable_wal = 56,
  connect_timeout = 57,
  dummy_packet_interval = 58,
  gbak_attach = 59,
  sql_role_name = 60,
  set_page_buffers = 61,
  working_directory = 62,
  sql_dialect = 63,
  set_db_readonly = 64,
  set_db_sql_dialect = 65,
  gfix_attach = 66,
  gstat_attach = 67,
  set_db_charset = 68,
  gsec_attach = 69,		/* deprecated  */
  address_path = 70,
  process_id = 71,
  no_db_triggers = 72,
  trusted_auth = 73,
  process_name = 74,
  trusted_role = 75,
  org_filename = 76,
  utf8_filename = 77,
  ext_call_depth = 78,
  auth_block = 79,
  client_version = 80,
  remote_protocol = 81,
  host_name = 82,
  os_user = 83,
  specific_auth_data = 84,
  auth_plugin_list = 85,
  auth_plugin_name = 86,
  config = 87,
  nolinger = 88,
  reset_icu = 89,
  map_attach = 90,
}

export enum isc_tpb {
  version1 = 1,
  consistency = 1,
  concurrency = 2,
  wait = 6,
  nowait = 7,
  read = 8,
  write = 9,
  ignore_limbo = 14,
  read_committed = 15,
  autocommit = 16,
  rec_version = 17,
  no_rec_version = 18,
  restart_requests = 19,
  no_auto_undo = 20
}

/*********************************/
/* Service parameter block stuff */
/*********************************/
export enum isc_spb {
    version1 = 1,
    current_version = 2,
    version = isc_spb.current_version,
    version3 = 3,
    user_name = isc_dpb.user_name,
    sys_user_name = isc_dpb.sys_user_name,
    sys_user_name_enc = isc_dpb.sys_user_name_enc,
    password = isc_dpb.password,
    password_enc = isc_dpb.password_enc,
    command_line = 105,
    dbname = 106,
    verbose = 107,
    options = 108,
    address_path = 109,
    process_id = 110,
    trusted_auth = 111,
    process_name = 112,
    trusted_role = 113,
    verbint = 114,
    auth_block = 115,
    auth_plugin_name = 116,
    auth_plugin_list = 117,
    utf8_filename = 118,
    client_version = 119,
    remote_protocol = 120,
    host_name = 121,
    os_user = 122,
    config = 123,
    expected_db = 124,
    connect_timeout = isc_dpb.connect_timeout,
    dummy_packet_interval = isc_dpb.dummy_packet_interval,
    sql_role_name = isc_dpb.sql_role_name,
    specific_auth_data = isc_spb.trusted_auth
}

  /*****************************
   * Service action items      *
   *****************************/
  export enum isc_action_svc {
    backup = 1,	/* Starts database backup process on the server */
    restore = 2,	/* Starts database restore process on the server */
    repair = 3,	/* Starts database repair process on the server */
    add_user = 4,	/* Adds a new user to the security database */
    delete_user = 5,	/* Deletes a user record from the security database */
    modify_user = 6,	/* Modifies a user record in the security database */
    display_user = 7,	/* Displays a user record from the security database */
    properties = 8,	/* Sets database properties */
    add_license = 9,	/* Adds a license to the license file */
    remove_license = 10,	/* Removes a license from the license file */
    db_stats = 11,	/* Retrieves database statistics */
    get_ib_log = 12,	/* Retrieves the InterBase log file from the server */
    get_fb_log = 12,	/* Retrieves the Firebird log file from the server */
    nbak = 20,	/* Incremental nbackup */
    nrest = 21,	/* Incremental database restore */
    trace_start = 22,	// Start trace session
    trace_stop = 23,	// Stop trace session
    trace_suspend = 24,	// Suspend trace session
    trace_resume = 25,	// Resume trace session
    trace_list = 26,	// List existing sessions
    set_mapping = 27,	// Set auto admins mapping in security database
    drop_mapping = 28,	// Drop auto admins mapping in security database
    display_user_adm = 29,	// Displays user(s) from security database with admin info
    validate = 30,	// Starts database online validation
    last = 31	// keep it last !
  }

  /*****************************
  * Service information items *
  *****************************/
  export enum isc_info_svc {
    svr_db_info = 50,	      /* Retrieves the number of attachments and databases */
    get_license = 51,	      /* Retrieves all license keys and IDs from the license file */
    get_license_mask = 52,	  /* Retrieves a bitmask representing licensed options on the server */
    get_config = 53,	      /* Retrieves the parameters and values for IB_CONFIG */
    version = 54,	          /* Retrieves the version of the services manager */
    server_version = 55,	  /* Retrieves the version of the Firebird server */
    implementation = 56,	  /* Retrieves the implementation of the Firebird server */
    capabilities = 57,	      /* Retrieves a bitmask representing the server's capabilities */
    user_dbpath = 58,	      /* Retrieves the path to the security database in use by the server */
    get_env = 59,	          /* Retrieves the setting of $FIREBIRD */
    get_env_lock = 60,	      /* Retrieves the setting of $FIREBIRD_LOCK */
    get_env_msg = 61,	      /* Retrieves the setting of $FIREBIRD_MSG */
    line = 62,	              /* Retrieves 1 line of service output per call */
    to_eof = 63,	          /* Retrieves as much of the server output as will fit in the supplied buffer */
    timeout = 64,	          /* Sets / signifies a timeout value for reading service information */
    get_licensed_users = 65, /* Retrieves the number of users licensed for accessing the server */
    limbo_trans = 66,	      /* Retrieve the limbo transactions */
    running = 67,	          /* Checks to see if a service is running on an attachment */
    get_users = 68,	      /* Returns the user information from isc_action_svc_display_users */
    auth_block = 69,	      /* Sets authentication block for service query() call */
    stdin = 78	              /* Returns maximum size of data, needed as stdin for service */
  }

  /*****************************************
   * Parameters for isc_action_svc_backup  *
   *****************************************/
export enum isc_spb_bkp {
    file =  5,
    factor = 6,
    length =  7,
    skip_data = 8,
    stat = 15,
    keyholder = 16,
    keyname = 17,
    crypt =	18,
    ignore_checksums = 0x01,
    ignore_limbo = 0x02,
    metadata_only = 0x04,
    no_garbage_collect = 0x08,
    old_descriptions = 0x10,
    non_transportable = 0x20,
    convert = 0x40,
    expand = 0x80,
    no_triggers = 0x8000,
    zip =	0x010000
}

/*****************************************
 * Parameters for isc_action_svc_restore *
 *****************************************/
export enum isc_spb_res {
  skip_data	= isc_spb_bkp.skip_data,
  buffers	=	9,
  page_size	=	10,
  length =	11,
  access_mode	=	12,
  fix_fss_data=	13,
  fix_fss_metadata =	14,
  deactivate_idx=	0x0100,
  no_shadow	=	0x0200,
  no_validity	=	0x0400,
  one_at_a_time	=	0x0800,
  replace =	0x1000,
  create =	0x2000,
  use_all_space	=	0x4000
}

/* Common, structural codes */
/****************************/
export enum isc_info {
    isc_info_end = 1,
    isc_info_truncated = 2,
    isc_info_error = 3,
    isc_info_data_not_ready = 4,
    isc_info_length = 126,
    isc_info_flag_end = 127
}
