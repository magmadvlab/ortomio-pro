SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
INSERT INTO certification_documents(garden_id, certification_type, title, type, status, uploaded_by, source_kind)
VALUES ('10000000-0000-0000-0000-000000000001', 'GLOBALGAP', 'Evidence', 'REPORT', 'APPROVED', '00000000-0000-0000-0000-000000000001', 'observed');
INSERT INTO certification_evidence_events(garden_id, certification_type, event_type, entity_type, operator_id, source_kind, certification_eligible)
VALUES ('10000000-0000-0000-0000-000000000001', 'GLOBALGAP', 'inspection', 'checklist', '00000000-0000-0000-0000-000000000001', 'observed', true);
DO $$ BEGIN
  BEGIN
    INSERT INTO certification_evidence_events(garden_id, certification_type, event_type, entity_type, operator_id, source_kind, certification_eligible)
    VALUES ('10000000-0000-0000-0000-000000000001', 'GLOBALGAP', 'demo', 'checklist', '00000000-0000-0000-0000-000000000001', 'simulated', true);
    RAISE EXCEPTION 'simulated evidence became eligible';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
DO $$ BEGIN
  BEGIN
    UPDATE certification_evidence_events SET event_type='changed';
    RAISE EXCEPTION 'append-only evidence updated';
  EXCEPTION WHEN object_not_in_prerequisite_state OR insufficient_privilege THEN NULL;
  END;
END $$;
INSERT INTO export_audit_log(user_id,garden_id,dataset,format,schema_version,row_count,content_sha256,timezone,source_tables)
VALUES ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','treatments','pdf','v2',2,repeat('a',64),'Europe/Rome',ARRAY['treatment_register']);
DO $$ BEGIN
  BEGIN
    INSERT INTO export_audit_log(user_id,garden_id,dataset,format,schema_version,row_count,content_sha256,timezone)
    VALUES ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','tasks','csv','v2',0,repeat('b',64),'Europe/Rome');
    RAISE EXCEPTION 'foreign garden export audit accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
DO $$ BEGIN
  BEGIN
    UPDATE certification_evidence_events SET event_type='changed';
    RAISE EXCEPTION 'append-only trigger bypassed by table owner';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
END $$;
SELECT 'P7 SQL assertions passed' AS result;
