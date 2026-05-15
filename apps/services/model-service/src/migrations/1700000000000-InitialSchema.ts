import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------------------------------
    // model
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'model',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          {
            name: 'grammagePUHT',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          { name: 'gamme', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'createdAt',
            type: 'datetime2',
            default: 'GETUTCDATE()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime2',
            default: 'GETUTCDATE()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // SQL Server system-versioned temporal table support
    await queryRunner.query(`
      ALTER TABLE [model]
      ADD [ValidFrom] datetime2 GENERATED ALWAYS AS ROW START HIDDEN NOT NULL DEFAULT GETUTCDATE(),
          [ValidTo]   datetime2 GENERATED ALWAYS AS ROW END   HIDDEN NOT NULL DEFAULT CONVERT(datetime2, '9999-12-31 23:59:59.9999999');
    `);
    await queryRunner.query(`
      ALTER TABLE [model]
      ADD PERIOD FOR SYSTEM_TIME ([ValidFrom], [ValidTo]);
    `);
    await queryRunner.query(`
      ALTER TABLE [model]
      SET (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.model_history));
    `);

    // -------------------------------------------------------------------------
    // ingredient
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'ingredient',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          {
            name: 'createdAt',
            type: 'datetime2',
            default: 'GETUTCDATE()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime2',
            default: 'GETUTCDATE()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // -------------------------------------------------------------------------
    // composition
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'composition',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'modelId', type: 'int', isNullable: false },
          { name: 'ingredientId', type: 'int', isNullable: false },
          {
            name: 'grammage',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'composition',
      new TableIndex({ name: 'IDX_composition_modelId', columnNames: ['modelId'] }),
    );
    await queryRunner.createIndex(
      'composition',
      new TableIndex({ name: 'IDX_composition_ingredientId', columnNames: ['ingredientId'] }),
    );

    await queryRunner.createForeignKey(
      'composition',
      new TableForeignKey({
        name: 'FK_composition_model',
        columnNames: ['modelId'],
        referencedTableName: 'model',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'composition',
      new TableForeignKey({
        name: 'FK_composition_ingredient',
        columnNames: ['ingredientId'],
        referencedTableName: 'ingredient',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // -------------------------------------------------------------------------
    // process
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'process',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'modelId', type: 'int', isNullable: false },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'process',
      new TableIndex({ name: 'IDX_process_modelId', columnNames: ['modelId'] }),
    );

    await queryRunner.createForeignKey(
      'process',
      new TableForeignKey({
        name: 'FK_process_model',
        columnNames: ['modelId'],
        referencedTableName: 'model',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // -------------------------------------------------------------------------
    // step
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'step',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'processId', type: 'int', isNullable: false },
          { name: 'stepOrder', type: 'int', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'step',
      new TableIndex({ name: 'IDX_step_processId', columnNames: ['processId'] }),
    );

    await queryRunner.createForeignKey(
      'step',
      new TableForeignKey({
        name: 'FK_step_process',
        columnNames: ['processId'],
        referencedTableName: 'process',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // -------------------------------------------------------------------------
    // test
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'test',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'processId', type: 'int', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'criteria', type: 'text', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'test',
      new TableIndex({ name: 'IDX_test_processId', columnNames: ['processId'] }),
    );

    await queryRunner.createForeignKey(
      'test',
      new TableForeignKey({
        name: 'FK_test_process',
        columnNames: ['processId'],
        referencedTableName: 'process',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // -------------------------------------------------------------------------
    // property
    // -------------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'property',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'modelId', type: 'int', isNullable: false },
          { name: 'encryptedKey', type: 'text', isNullable: false },
          { name: 'encryptedValue', type: 'text', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'property',
      new TableIndex({ name: 'IDX_property_modelId', columnNames: ['modelId'] }),
    );

    await queryRunner.createForeignKey(
      'property',
      new TableForeignKey({
        name: 'FK_property_model',
        columnNames: ['modelId'],
        referencedTableName: 'model',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order of creation to respect FK constraints

    await queryRunner.dropForeignKey('property', 'FK_property_model');
    await queryRunner.dropIndex('property', 'IDX_property_modelId');
    await queryRunner.dropTable('property');

    await queryRunner.dropForeignKey('test', 'FK_test_process');
    await queryRunner.dropIndex('test', 'IDX_test_processId');
    await queryRunner.dropTable('test');

    await queryRunner.dropForeignKey('step', 'FK_step_process');
    await queryRunner.dropIndex('step', 'IDX_step_processId');
    await queryRunner.dropTable('step');

    await queryRunner.dropForeignKey('process', 'FK_process_model');
    await queryRunner.dropIndex('process', 'IDX_process_modelId');
    await queryRunner.dropTable('process');

    await queryRunner.dropForeignKey('composition', 'FK_composition_ingredient');
    await queryRunner.dropForeignKey('composition', 'FK_composition_model');
    await queryRunner.dropIndex('composition', 'IDX_composition_ingredientId');
    await queryRunner.dropIndex('composition', 'IDX_composition_modelId');
    await queryRunner.dropTable('composition');

    await queryRunner.dropTable('ingredient');

    // Disable temporal table before dropping
    await queryRunner.query(`ALTER TABLE [model] SET (SYSTEM_VERSIONING = OFF)`);
    await queryRunner.query(`ALTER TABLE [model] DROP PERIOD FOR SYSTEM_TIME`);
    await queryRunner.dropTable('model_history', true);
    await queryRunner.dropTable('model');
  }
}
