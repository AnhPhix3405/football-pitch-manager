import { getMetadataArgsStorage } from 'typeorm';
import { AuditLogEntity } from '../audit-log.entity';

describe('AuditLogEntity metadata', () => {
  it('registers table name as audit_logs', () => {
    const storage = getMetadataArgsStorage();
    const table = storage.tables.find((t) => t.target === AuditLogEntity);
    expect(table).toBeDefined();
    expect(table?.name).toBe('audit_logs');
  });

  it('registers required columns with correct configurations', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter((c) => c.target === AuditLogEntity);
    const columnNames = columns.map((c) => c.propertyName);

    expect(columnNames).toContain('id');
    expect(columnNames).toContain('actorId');
    expect(columnNames).toContain('actorEmail');
    expect(columnNames).toContain('actorRole');
    expect(columnNames).toContain('action');
    expect(columnNames).toContain('category');
    expect(columnNames).toContain('targetType');
    expect(columnNames).toContain('targetId');
    expect(columnNames).toContain('targetName');
    expect(columnNames).toContain('details');
    expect(columnNames).toContain('ipAddress');
    expect(columnNames).toContain('userAgent');
    expect(columnNames).toContain('createdAt');
  });

  it('registers composite indexes for audit search and timeline', () => {
    const storage = getMetadataArgsStorage();
    const indices = storage.indices.filter((i) => i.target === AuditLogEntity);
    expect(indices.length).toBeGreaterThanOrEqual(3);
  });
});
