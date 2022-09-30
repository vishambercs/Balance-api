const Networks = require('../Models/network.js');
var mongoose = require('mongoose');
var Constant = require('../common/Constant');
const Web3      = require('web3');


module.exports =
{
    async create_or_update_network(req, res) {
        try {
            if (req.body.id == "0") 
            {
                let network = await Networks.insertMany([{
                    id              : mongoose.Types.ObjectId(),
                    coin            : req.body.coin,
                    libaraytype     : req.body.libaraytype,
                    cointype        : req.body.cointype,
                    contractaddress : req.body.contractaddress,
                    nodeurl         : req.body.nodeurl,
                    icon            : (req.body.icon == undefined || req.body.icon == "") ? "" : req.body.icon,
                    timestamps  : new Date().toString(),
                }])
                res.json({ status: 200, data: network, message: "Saved" })
            }
            else{
                let network =     await Networks.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        coin: req.body.coin,
                        libaraytype: req.body.libaraytype,
                        cointype: req.body.cointype,
                        contractaddress: req.body.contractaddress,
                        nodeurl: req.body.nodeurl,
                        icon: (req.body.icon == undefined || req.body.icon == "") ? "" : req.body.icon,
                    }
                },
                { returnDocument: 'after' }
                )
                res.json({ status: 200, data: network, message: "Updated" })
            }

        }
        catch (error) {
            console.log("create_or_update_network",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getBalance(req, res) {
        let token_balance = 0
        let format_token_balance = 0
        let native_balance = 0
        let format_native_balance = 0
        try {
            console.log(req.body.network)
                let networkdetails= await Networks.findOne({"coin" : req.body.network})
                console.log(networkdetails)
                const WEB3 = new Web3(new Web3.providers.HttpProvider(networkdetails.nodeurl))
                // if (req.body.contract != "") 
                // {
                //     const contract = new WEB3.eth.Contract(Constant.USDT_ABI, req.body.contract);
                //     token_balance = await contract.methods.balanceOf(req.body.address.toLowerCase()).call();
                //     let decimals = await contract.methods.decimals().call();
                //     format_token_balance = token_balance / (1 * 10 ** decimals)
                // }
                native_balance = await WEB3.eth.getBalance(req.body.address.toLowerCase())
                format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
                native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
                format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
    
                let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
                
                res.json({ status: 200, data: balanceData, message: "Saved" })
            
        }
        catch (error) {
            console.log(error)
            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            res.json({ status: 400, data: balanceData, message: "Error" })
        }
    }
}