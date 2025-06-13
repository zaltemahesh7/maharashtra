const { send } = require("../../utility/apiResponse");
const service = require("./services");

module.exports = {
    create: async (req, res)=> {
        // console.log(req.body)
        const resp = await service.create(req.body);
        res.status(200).send(resp)
    },
    fetch: async (req, res)=> {
        const resp = await service.fetch();
        res.status(200).send(resp)
    },
    update: async (req, res)=> {
        const resp = await service.update(req.body, req.params.id);
        send(resp, res);
    }, 
    fetchById: async (req, res)=> {
        const resp = await service.fetchById(req.params.id);
        res.status(200).send(resp)
    },
    fetchByDivisionId: async (req, res)=> {
        const resp = await service.fetchByDivisionId(req.params.id);
        res.status(200).send(resp)
    },
    delete: async (req, res)=> {
        const resp = await service.delete(req.params.id);
        res.status(200).send(resp)
    }, 
}
