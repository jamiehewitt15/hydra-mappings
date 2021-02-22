import { Service } from 'typedi';
import { Post } from '../post/post.model';

import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository, getConnection, EntityManager } from 'typeorm';

import { PostSearchFTSOutput } from './postSearch.resolver';

interface RawSQLResult {
    origin_table: string,
    id: string,
    rank: number,
    highlight: string
}

@Service('PostSearchFTSService')
export class PostSearchFTSService {
    readonly postRepository: Repository<Post>;

    constructor(@InjectRepository(Post) postRepository: Repository<Post>
                 ) {
        this.postRepository = postRepository;
    }

    async search(text: string, limit:number = 5): Promise<PostSearchFTSOutput[]> {
        
        return getConnection().transaction<PostSearchFTSOutput[]>('REPEATABLE READ', async (em: EntityManager) => {
            const query = `
            SELECT origin_table, id, 
                ts_rank(tsv, phraseto_tsquery('english', $1)) as rank,
                ts_headline(document, phraseto_tsquery('english', $1)) as highlight
            FROM post_search_view
            WHERE phraseto_tsquery('english', $1) @@ tsv
            ORDER BY rank DESC
            LIMIT $2`;

            const results = await em.query(query, [text, limit]) as RawSQLResult[];

            if (results.length == 0) {
                return [];
            }

            const idMap:{ [id:string]: RawSQLResult } = {};
            results.forEach(item => idMap[item.id] = item);
            const ids: string[] = results.map(item => item.id);
            
            const posts: Post[] = await em.createQueryBuilder<Post>(Post, 'Post')
                        .where("id IN (:...ids)", { ids }).getMany();

            const enhancedEntities = [...posts ].map((e) => {
                return { item: e, 
                    rank: idMap[e.id].rank, 
                    highlight: idMap[e.id].highlight,
                    isTypeOf: idMap[e.id].origin_table } as PostSearchFTSOutput;
            });

            return enhancedEntities.reduce((accum: PostSearchFTSOutput[], entity) => {
                if (entity.rank > 0) {
                    accum.push(entity);
                }
                return accum;
            }, []).sort((a,b) => b.rank - a.rank);

        })
    }
}