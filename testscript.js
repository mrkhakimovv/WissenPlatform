import fs from "fs";

fs.writeFileSync("test.html", `<div class="bg-white/50 text-white border-white"></div>
<div class="text-black bg-black/10"></div>`);
