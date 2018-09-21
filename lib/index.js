var prompt = require('prompt');
var shell = require('shelljs');
//
// Start the prompt
//
prompt.start();

//
// Get two properties from the user: username and email
//
prompt.get([{
    name: "className",
    description: 'class name ex) Hello'
}], (err, result) => {
    //
    // Log the results.
    //
    console.log('Command-line input received:');
    console.log(`class name is ${result.className}`);
    const currentPath = shell.pwd()
    console.log(shell.touch(currentPath + `/src/controller/${result.className}Controller.ts`))
    console.log(shell.touch(currentPath + `/src/service/${result.className}Service.ts`))
    console.log(shell.touch(currentPath + `/src/dao/${result.className}Dao.ts`))
    console.log(shell.touch(currentPath + `/src/entity/${result.className}.ts`))
    console.log(`---------make files complete------------------------`);
    console.log(`---------now put the default code in files----------`);
    const contents = makeContents(result.className);
    console.log(shell.echo(contents.controller).to(`${currentPath}/src/controller/${result.className}Controller.ts`))
    console.log(shell.echo(contents.service).to(`${currentPath}/src/service/${result.className}Service.ts`))
    console.log(shell.echo(contents.dao).to(`${currentPath}/src/dao/${result.className}Dao.ts`))
    console.log(shell.echo(contents.entity).to(`${currentPath}/src/entity/${result.className}.ts`))

    console.log(`
        파일이 생성되었습니다. 다음 작업들을 하시면 사용하실 수 있습니다.
        1. ${currentPath}/src/constant/types.ts 에서 ${result.className}Service: Symbol.for('${result.className}Service'),
           ${result.className}tDao: Symbol.for('${result.className}Dao') 이 두 심볼을 추가 해주세요.
        2. ${currentPath}/src/controller/index.ts 에서 ${result.className}Controller 모듈을 추가해주세요.
        3. ${currentPath}/src/dao/index.ts 에서 ${result.className}Dao 모듈을 추가해주세요.
        4. ${currentPath}/src/service/index.ts 에서 ${result.className}Service 모듈을 추가해주세요.
    `)
});

const makeContents = (className) => {
    const controller = `
    import { controller, httpGet } from 'inversify-express-utils';
    import { inject } from 'inversify';
    import { ${className}Service } from '../service';
    import * as express from 'express';
    import TYPES from '../constant/types';
    import { ${className} } from "../entity";
    import { errorExceptionHandler } from "../util/util";

    @controller('/api/${className.toLowerCase()}')
    export class ${className}Controller {
    
        constructor(@inject(TYPES.${className}Service) private ${className.toLowerCase()}Service: ${className}Service) {
        }
    
        @httpGet('/')
        public async get${className}s(request: express.Request, response: express.Response) {
            try {
                return response.status(200).json({});
            } catch (e) {
                errorExceptionHandler(e, response);
            }
        }
    }        
    `

    const service = `
    import { ${className} } from "../entity";
    import { inject, injectable } from "inversify";
    import TYPES from "../constant/types";
    import { ${className}Dao } from "../dao";
    
    @injectable()
    export class ${className}Service {
    
        @inject(TYPES.${className}Dao)
        private dao: ${className}Dao;
    
        public async getSample(hash: string) {
        }
    }
    
    `

    const dao = `
    import { injectable } from "inversify";
    import { ${className} } from "../entity";
    import { AbstractDao } from "./base/AbstractDao";
    
    @injectable()
    export class ${className}Dao extends AbstractDao<${className}> {
        constructor() {
            super(${className});
        }
    
        public async findOneById(objectId: number): Promise<${className}> {
            try {
                return this.repo.findOne(1);
            } catch (e) {
            }
        }
    }
    `

    const entity = `    
    @Entity()
    export class ${className} {
    }
    `

    return {
        controller: controller,
        service: service,
        dao: dao,
        entity: entity
    }
}