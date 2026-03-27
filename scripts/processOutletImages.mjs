import fs from 'fs';
import path from 'path';

const scratchpadData = [
  {"id":129,"product_name":"DUOLINE - 68","openability":"Inward","color_outside":"RAL 7016 M - mat","color_inside":"White","height":"1000","width":"1500","material":"Wood","price_netto":260.47,"price_currency":"EUR","image_hashes":["4cfb04644229b05df7b83c98d9e58ee2","aa55e4fc22d2ebf7c76eb6c9cc9165b7","4e0a22b167173915b269e27342770e1f"],"product_type":"Window","product_addons":"---"},
  {"id":449,"product_name":"DUOLINE - 78","openability":"Inward","color_outside":"RAL 7016 M - mat","color_inside":"085 teak","height":"2400","width":"1100","material":"Wood","price_netto":518.11,"price_currency":"EUR","image_hashes":["b51305becdd9e315776a89933d5a6896","d9169f3557618bb7309106d5a7bb4c1b","b9eecda194c358087104917394dd4525"],"product_type":"Balcony","product_addons":"---"},
  {"id":445,"product_name":"DUOLINE - 88","openability":"Inward","color_outside":"RAL 7016 M - mat","color_inside":"czarny szary gładki (7021) 02.11.71.000042.097","height":"2400","width":"1100","material":"Wood","price_netto":478.16,"price_currency":"EUR","image_hashes":["89e195d9e090789c16991d6c1e2ab879","338ae2e572047d2f8f53693904769ca0","01b6d77950adec0bdcd39e497d2f35cd"],"product_type":"Balcony","product_addons":"---"},
  {"id":446,"product_name":"DUOLINE - 88","openability":"Inward","color_outside":"RAL 7016 M - mat","color_inside":"006 dąb jasny","height":"1500","width":"1300","material":"Wood","price_netto":378.12,"price_currency":"EUR","image_hashes":["21f3caf9b5352a1428dbdae9da12066c","32ab0893123365cd3f1bf844f34f1c81","d68598f9469aae7613e6a9d9f8653b1d"],"product_type":"Window","product_addons":"---"},
  {"id":450,"product_name":"DUOLINE - 88","openability":"Inward","color_outside":"RAL 9005","color_inside":"006 dąb jasny","height":"1500","width":"1300","material":"Wood","price_netto":621.87,"price_currency":"EUR","image_hashes":["d23919fd9eae6f233322055e15a50bb6","9a82d19c53366e376be4299514b84ae5","9677bb17f981f4c5eb672b9d6ece1619"],"product_type":"Window","product_addons":"---"},
  {"id":642,"product_name":"DUOLINE - 88","openability":"Inward","color_outside":"RAL 6005 T - drobna struktura","color_inside":"RAL 6005 T - drobna struktura","height":"1500","width":"1300","material":"Wood","price_netto":482.92,"price_currency":"EUR","image_hashes":["170a6f310cbc0f9ff27f5d43056bf5a3","c5834a6f5222ce4676d25fc5ec44dae1","2305ea8ce2eb923185f56f8fa556590a"],"product_type":"Window","product_addons":"---"},
  {"id":1048,"product_name":"IDEAL NEO 76 AD","openability":"Inward","color_outside":"Veneer Nut 2178007-167","color_inside":"White","height":"1600","width":"1650","material":"PCV","price_netto":136.46,"price_currency":"EUR","image_hashes":["448c12c2a5a9afe7103e75e07ec3805a","c4da3869b87fd532ab2943c4a0a1acc5","9aa1e22c576b61cc59c7c0a510364c77"],"product_type":"Window","product_addons":"---"},
  {"id":515,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Anthracite 701605-167","color_inside":"White","height":"2430","width":"940","material":"PCV","price_netto":420.72,"price_currency":"EUR","image_hashes":["387871618996afba68534e698f6b6c4b","c53feadedbcc2df1d4f4837aa2577884","c20fec7e938362ef8bbed47f91cf3e7b"],"product_type":"Door","product_addons":"---"},
  {"id":347,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Golden Oak 2178001-167","color_inside":"Veneer Golden Oak 2178001-167","height":"1810","width":"990","material":"PCV","price_netto":254.71,"price_currency":"EUR","image_hashes":["928352c410e9bab48d32482ffa0a04fb","7b847e8b78d44403a868212a1ddab34a","c7177bb5a66c1630646db2eb02f07646"],"product_type":"Door","product_addons":"---"},
  {"id":780,"product_name":"Iglo 5","openability":"Outward","color_outside":"Veneer Sheffield Oak Light F456-3081","color_inside":"Veneer Sheffield Oak Light F456-3081","height":"2110","width":"1000","material":"PCV","price_netto":419.86,"price_currency":"EUR","image_hashes":["e7e89dbae12e49263a08e786c5699864","0b4e109f9bb0fc955e01dc6ecb92e323","8ab1a964171c1dc5ffa19f135ba1c90a"],"product_type":"Door","product_addons":"---"},
  {"id":254,"product_name":"Iglo 5","openability":"Inward","color_outside":"White","color_inside":"White","height":"2190","width":"1545","material":"PCV","price_netto":460.87,"price_currency":"EUR","image_hashes":["9cc48f71c7a12570b5f0ee0d02dc6358","eef06db699fca833b405f44476fabf2a","ecf97fa19234f454eae72efa37b96357"],"product_type":"Door","product_addons":"---"},
  {"id":331,"product_name":"Iglo 5","openability":"Other","color_outside":"Veneer Chocolate Brown 887505-167","color_inside":"White","height":"1480","width":"860","material":"PCV","price_netto":69.23,"price_currency":"EUR","image_hashes":["3c1354cb8a7d8a64d993b1a0b12c34c2","14957c7abb4a6e259b336f197f9d3fc5","c297af4a6c8e486507f2452fc4a020d0"],"product_type":"Renovation, Window","product_addons":"---"},
  {"id":409,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Anthracite Ulti-Matt 02.20.71.000001-504700-047","color_inside":"Veneer Anthracite Ulti-Matt 02.20.71.000001-504700-047","height":"2400","width":"1100","material":"PCV","price_netto":786.85,"price_currency":"EUR","image_hashes":["4a0783af23db993528a8ac89839d6ae3","a73f4d8e7632329ebe4d811dc24243e6","7fcebc5079dfd31ccb7cf39030ed44a9"],"product_type":"Door","product_addons":"---"},
  {"id":423,"product_name":"Iglo 5","openability":"Inward","color_outside":"White","color_inside":"White","height":"2430","width":"1055","material":"PCV","price_netto":452.15,"price_currency":"EUR","image_hashes":["5b236ce37a23947a489d51ff70e04053","9acfd316d664c4f5e2e7bf6e9f22fc44","7c8bb1ece48579d14935cabdf1ce8a89"],"product_type":"Door","product_addons":"---"},
  {"id":775,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Golden Oak 2178001-167","color_inside":"White","height":"2185","width":"1720","material":"PCV","price_netto":391.59,"price_currency":"EUR","image_hashes":["82ae4cc304ca70e409031eb5dd27e8fc","d7dad7373cbfbb29519466a99cdb6b15","c904d4ad6a629b61c0f87f4bd875513d"],"product_type":"Balcony","product_addons":"---"},
  {"id":491,"product_name":"Iglo 5","openability":"Outward","color_outside":"White","color_inside":"White","height":"2050","width":"980","material":"PCV","price_netto":426.43,"price_currency":"EUR","image_hashes":["8ee20013dd2cf89933d035308c2f5024","d91f83e5f44a167136e8beb530b69c66","dd8bc9bffa8e061e2fec5a3496693c23"],"product_type":"Door","product_addons":"---"},
  {"id":238,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Nut 2178007-167","color_inside":"Veneer Nut 2178007-167","height":"2520","width":"1070","material":"PCV","price_netto":372.06,"price_currency":"EUR","image_hashes":["2460bbf44ac67ab41889299ae23ad2e0","dde475d81867cf02ce9963a0a44ee7fe","a116c80fe5ead5e7e64005096b22ff82"],"product_type":"Renovation, Door","product_addons":"---"},
  {"id":774,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Anthracite 701605-167","color_inside":"White","height":"2380","width":"1100","material":"PCV","price_netto":660.47,"price_currency":"EUR","image_hashes":["63fd37f90fe7a4aeabed9059c1be7115","afed3e2142efe793f3e2dfb4e7b183b8","0c91a0a44b5942296ffdcb5c22b6f3a3"],"product_type":"Door","product_addons":"---"},
  {"id":773,"product_name":"Iglo 5","openability":"Outward","color_outside":"Veneer Anthracite 701605-167","color_inside":"Veneer Anthracite 701605-167","height":"1955","width":"970","material":"PCV","price_netto":555.29,"price_currency":"EUR","image_hashes":["cd66d95899af5f67c1120789bf9643c4","4fc6cc84c5f5f6df8700dc056abea86f","4e93b70de9c257945a24ecc46c6d3db0"],"product_type":"Door","product_addons":"---"},
  {"id":626,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Anthracite 701605-167","color_inside":"White","height":"2130","width":"1560","material":"PCV","price_netto":492.08,"price_currency":"EUR","image_hashes":["c7ad7eacccc80820ed1c3ec7a62c4903","7ca3425129a371425d15505b0c916fcc","fea6ae2c4648b7075ba09ab69f54f879"],"product_type":"Door","product_addons":"---"},
  {"id":278,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Nut 2178007-167","color_inside":"Veneer Nut 2178007-167","height":"2675","width":"895","material":"PCV","price_netto":399.03,"price_currency":"EUR","image_hashes":["88ffd3b61732bf7de885b838aeb718ed","8eec0acc44b5e3bd0c32f2bda400c2ff","dd0480efba2900c560ba22ffff3125e8"],"product_type":"Door","product_addons":"---"},
  {"id":826,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer White FX-915205-168","color_inside":"Veneer White FX-915205-168","height":"1500","width":"1300","material":"PCV","price_netto":470.32,"price_currency":"EUR","image_hashes":["f69442295d7ab92f0b057f8b67ba8669","870d80e9aadddeaa002b81aebeb29f56","f2dd29556b2705020de12c1d445724d6"],"product_type":"Window","product_addons":"Shutter"},
  {"id":922,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Dark Red 308105-167","color_inside":"Veneer White FX-915205-168","height":"1530","width":"1910","material":"PCV","price_netto":241.96,"price_currency":"EUR","image_hashes":["67c4b542a5b09e050b1600adfdd15d95","9c46fe9f3a5fcf30e02f1169e44c5d47"],"product_type":"Window","product_addons":"---"},
  {"id":813,"product_name":"Iglo 5","openability":"Inward","color_outside":"Veneer Nut 2178007-167","color_inside":"Veneer Nut 2178007-167","height":"1985","width":"890","material":"PCV","price_netto":284.78,"price_currency":"EUR","image_hashes":["01603c6d3336f8403fc0140637da8900","fb9e813d707f84c928dc0f019efc3b4f","e70ed202d96e0251e4690f2d08a88a12"],"product_type":"Renovation, Door","product_addons":"---"}
];

const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjMxNjAzLCJpYXQiOjE3NzQ2MzEwMTQsImp0aSI6ImViYTFjYWFhYTVkZjQ2MjdhODY2YWRjNDhlNWJhMWYyIiwidXNlcl9pZCI6NjI3MSwiaXNfY29tcGFueV9zdSI6dHJ1ZSwiaXNfZHJ1X2VtcGxveWVlIjpmYWxzZSwiY29tcGFueV9wZXJtaXNzaW9ucyI6W119.1CdYy0A2qfx_iI4TqA04PyoDqi_csENkyqpQ2rukIOY';

const outputDir = path.join(process.cwd(), 'public/outlet');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const mappedProducts = scratchpadData.map(p => ({
    id: p.id,
    name: p.product_name,
    type: p.product_type,
    height: parseInt(p.height, 10),
    width: parseInt(p.width, 10),
    material: p.material,
    openability: p.openability,
    innerColor: p.color_inside,
    outerColor: p.color_outside,
    price: p.price_netto,
    currency: p.price_currency,
    imageHashes: p.image_hashes,
    localImages: p.image_hashes.map(hash => `/outlet/${hash}.jpg`)
}));

fs.writeFileSync(
    path.join(process.cwd(), 'src/data/outlet_products.json'),
    JSON.stringify(mappedProducts, null, 2)
);

async function downloadImages() {
    console.log("Downloading images using native Fetch API...");
    for (const prod of mappedProducts) {
        for (const hash of prod.imageHashes) {
            const filepath = path.join(outputDir, `${hash}.jpg`);
            if (fs.existsSync(filepath)) continue;

            const url = `https://e-portal-backend.drutex.pl/pages/outlet/${hash}/image/`;
            console.log("Fetching", hash);
            try {
                const res = await fetch(url, { headers: { 'authorization': AUTH_TOKEN } });
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
                } else {
                    console.log("Failed", res.status);
                }
            } catch (err) {
                console.log("Error fetching", hash, err);
            }
        }
    }
    console.log("Image download complete.");
}

downloadImages();
