# Build Steps

1. Suggestions
   - [ ] suggest **eslint** (and **tslint removal**)
   - [ ] suggest **ttsc** and **typescript-transform-paths** (for path aliases)
   - [ ] suggest removal of webpack: **serverless-webpack** => remove webpack plugin and other webpack deps, install rollup deps instead
   - [ ] suggest addition of **serverless-sam**
  
2. Ensure Key Dependencies

    - [x] This includes `serverless.ts` file, 
    - [x] that user has `ts-node` and `typescript` installed locally,
    - [ ] That the `serverless.ts` file is _using_ the Serverless() helper
    - [ ] That Serverless() is used in an async block
    - [ ] That the `serverless.ts` is _transpilable_ with **tsc**

3. Identify the key environment variables for AWS

    - [ ] AWS_PROFILE, 
    - [ ] AWS_STAGE,
    - [ ] AWS_REGION,
    - [ ] AWS_PARTITION,
    - [ ] AWS_ACCOUNT_ID,
    - use interactive prompts if need be

4. Identify Handler Functions 
   - [ ] Build string enumeration -- `LambdaFunction` -- for function identity (aka., here are the full set of functions). Descriptions should be included as comments.
   - [ ] Write function name-to-file mapping config to the `.do-devops.json` config file

5. Identify Step Functions
    - [ ] Build string enumeration -- `StepFunction` -- for Step Function identity.
    - [ ] Write step functions to `.do-devops.json` config file

6. [ ] Handoff to execution of `serverless.ts` (which uses the `Serverless()` configurator)

    > `do-devops` will set all AWS variables as ENV variables and then execute the `serverless.ts` with this context

7. [ ] ENV variables in `env.ts` file are incorporated into 
8. [ ] provides strongly typed way to put in configuration (simple object hash)
9.  [ ] provides strongly typed _default_ function config
10. [ ] function config is built based on ENV and merge of function config with defaults

### Composability

9. [ ] Each section -- IAM, Plugins, Resources, etc. -- has a _builder_ function to help facilitate ease of use
 