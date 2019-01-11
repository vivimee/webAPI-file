const Koa = require('koa');
const KoaBody = require('koa-body');
const router = require('koa-router')();

const app = new Koa();

router.get('/', async(ctx) => {
    ctx.body = 'hello';
});
router.post('/upload', async(ctx, next) => {
    await next();
    return ctx.body = ctx.request.files.formdataKey.path;
});

app.use(async(ctx, next) => {
    await next();
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
    ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");
});
app.use(KoaBody({
    multipart: true,
    formidable: {
        uploadDir: './uploads',
        keepExtensions: true
    }
}));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7000);