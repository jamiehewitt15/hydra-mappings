import { MigrationInterface, QueryRunner } from "typeorm";

export class PostSearchMigration1614010586615 implements MigrationInterface {
    name = 'postSearchMigration1614010586615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // TODO: escape 
        await queryRunner.query(`
            ALTER TABLE post 
            ADD COLUMN post_search_tsv tsvector 
            GENERATED ALWAYS AS (  
                    setweight(to_tsvector('english', coalesce("content", '')), 'A') 
                ) 
            STORED;
        `);
        await queryRunner.query(`
            ALTER TABLE post 
            ADD COLUMN post_search_doc text 
            GENERATED ALWAYS AS (  
                    coalesce("content", '') 
                ) 
            STORED;
        `);
        await queryRunner.query(`CREATE INDEX post_search_post_idx ON post USING GIN (post_search_tsv)`);

        await queryRunner.query(`
            CREATE VIEW post_search_view AS
            SELECT 
                text 'post' AS origin_table, id, post_search_tsv AS tsv, post_search_doc AS document 
            FROM
                post
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW post_search_view`);
        await queryRunner.query(`DROP INDEX post_search_post_idx`);
        await queryRunner.query(`ALTER TABLE post DROP COLUMN post_search_tsv`);
        await queryRunner.query(`ALTER TABLE post DROP COLUMN post_search_doc`);
    }


}
