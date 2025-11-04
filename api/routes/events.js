const express = require("express");
const router = express.Router();
const Enum = require("../config/Enum");
const emitter = require("../lib/Emitter");

emitter.addEmitter("notifications");

router.get("/", async (req, res) => {
    res.writeHead(Enum.HTTP_CODES.OK, {
        "content-type": "text/event-stream",
        "connection": "keep-alive",
        "cache-control": "no-cache, no-transform"
    });

    const listener = (data) => {
        res.write("data: "+JSON.stringify(data)+"\n\n");
    }

    //Aşağıdaki on ve off fonksiyonlarında ikinci parametre olan listener'ın her iki fonksiyon içerisinde
    //aynı değere sahip olması gerektiği için yukarıda const listener tanımlanıp aşağıda her iki fonksiyona
    //parametre olarak verildi.
    
    emitter.getEmitter("notifications").on("messages", listener);

    req.on("close", () => {
        emitter.getEmitter("notifications").off("messages", listener);
    });
});

module.exports = router;