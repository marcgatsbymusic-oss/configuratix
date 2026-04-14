# 01 – Drutex Product Lines

> **Source:** `DRUTEX_DEALER.dbo.PRODTYP`  
> **Extracted:** 13.04.2026, 14:01:10  
> **Distinct product types:** 620  
> **Read-only query – no DB writes performed.**

---

## Key Finding: Table Architecture

| Table | Role |
|-------|------|
| **`PRODTYP`** | **Product line / type definitions** – one record per product line |
| **`PRODUKTSYSTEME`** | Colour/profile grouping system (ALU, DRE, DRUTEX1–4…) |
| `PRODTYP.PRODUCTSYSTEM` | FK → `PRODUKTSYSTEME.PRODUKTSYSTEM` (links product to colour group) |
| `PRODTYP.MATERIALART` | Material code: **2=PVC, 3=Aluminium, 4=Wood** |
| `PRODTYP.BEZEICHNUNG` | Product line description / display name |

---

## Master Product Lines Table

| Code | Description | Product Type | Material |
|------|-------------|--------------|----------|
| `1000` | ===== PVC ========================== | Window / Door | PVC |
| `1004` | IGLO HS | Sliding Door / HST | PVC |
| `1005` | IGLO SL | Sliding Door | PVC |
| `1006` | IGLO SL - NAROZNIK | Sliding Door | PVC |
| `1007` | IGLO EDGE SLIDE | Sliding Door | PVC |
| `1008` | IGLO HS - NAROZNIK | Sliding Door / HST | PVC |
| `1014` | IGLO HS ALUCOVER | Sliding Door / HST | PVC |
| `1100` | IGLO 5 - windows | Window | PVC |
| `1101` | IGLO 5 - PSK | Sliding Door / HST | PVC |
| `1102` | IGLO 5 - intermediate profile | Profile Component | PVC |
| `1103` | IGLO 5 - Entrance doors | Entrance Door | PVC |
| `1104` | IGLO 5 - Entrance doors - Corner | Entrance Door | PVC |
| `1105` | IGLO 5 - intermediate profile PSK | Sliding Door / HST | PVC |
| `1106` | IGLO 5 - DRZWI SERWISOWE | Entrance Door | PVC |
| `1108` | IGLO 5 - Corner | Corner Window / Door | PVC |
| `1109` | IGLO 5 - sets | Window / Door | PVC |
| `1110` | IGLO 5 CLASSIC - WINDOWS | Window | PVC |
| `1111` | IGLO 5 CLASSIC - PSK | Sliding Door / HST | PVC |
| `1118` | IGLO 5 CLASSIC - Corner | Corner Window / Door | PVC |
| `1119` | IGLO 5 CLASSIC - sets | Window / Door | PVC |
| `1120` | IGLO 5 RENO - windows | Window | PVC |
| `1121` | IGLO 5 RENO - PSK | Sliding Door / HST | PVC |
| `1122` | IGLO 5 RENO - intermediate profile | Profile Component | PVC |
| `1123` | IGLO 5 RENO - Entrance doors | Entrance Door | PVC |
| `1124` | IGLO 5 RENO - Entrance doors NAROZNIK | Entrance Door | PVC |
| `1126` | IGLO 5 RENO - DRZWI SERWISOWE | Entrance Door | PVC |
| `1128` | IGLO 5 RENO - Corner | Corner Window / Door | PVC |
| `1129` | IGLO 5 RENO - sets ??? | Window / Door | PVC |
| `1130` | IGLO 5 CLASSIC RENO - windows | Window | PVC |
| `1131` | IGLO 5 CLASSIC RENO - PSK | Sliding Door / HST | PVC |
| `1132` | IGLO 5 CLASSIC RENO - intermediate profile | Profile Component | PVC |
| `1138` | IGLO 5 CLASSIC RENO - Corner | Corner Window / Door | PVC |
| `1139` | IGLO 5 CLASSIC RENO - sets ??? | Window / Door | PVC |
| `1140` | IGLO 5 ADAPT - windows | Window | PVC |
| `1141` | IGLO 5 ADAPT - PSK | Sliding Door / HST | PVC |
| `1143` | IGLO 5 ADAPT - door | Entrance Door | PVC |
| `1144` | IGLO 5 ADAPT - door Corner | Entrance Door | PVC |
| `1145` | IGLO 5 ADAPT - intermediate profile PSK | Sliding Door / HST | PVC |
| `1146` | IGLO 5 ADAPT - DRZWI SERWISOWE | Entrance Door | PVC |
| `1148` | IGLO 5 ADAPT - Corner | Corner Window / Door | PVC |
| `1149` | IGLO 5 ADAPT - ZESTAWY | Window / Door | PVC |
| `1150` | IGLO 5 CLASSIC ADAPT - windows | Window | PVC |
| `1151` | IGLO 5 CLASSIC ADAPT - PSK | Sliding Door / HST | PVC |
| `1158` | IGLO 5 CLASSIC ADAPT - Corner | Corner Window / Door | PVC |
| `1159` | IGLO 5 CLASSIC ADAPT - ZESTAWY | Window / Door | PVC |
| `1200` | IGLO LIGHT - WINDOWS | Window | PVC |
| `1201` | IGLO LIGHT - PSK | Sliding Door / HST | PVC |
| `1208` | IGLO LIGHT - Corner | Corner Window / Door | PVC |
| `1209` | IGLO LIGHT - sets | Window / Door | PVC |
| `1210` | IGLO LIGHT RENO - windows | Window | PVC |
| `1211` | IGLO LIGHT RENO - PSK | Sliding Door / HST | PVC |
| `1218` | IGLO LIGHT RENO - NAROZNIK | Corner Window / Door | PVC |
| `1219` | IGLO LIGHT RENO - sets??? | Window / Door | PVC |
| `1250` | IGLO LIGHT ADAPT- windows | Window | PVC |
| `1258` | IGLO LIGHT ADAPT- NAROZNIK | Corner Window / Door | PVC |
| `1259` | IGLO LIGHT ADAPT - ZESTAWY | Window / Door | PVC |
| `1300` | IGLO ENERGY  - windows | Window | PVC |
| `1301` | IGLO ENERGY  - PSK | Sliding Door / HST | PVC |
| `1302` | IGLO ENERGY - PROFIL POŚREDNI | Profile Component | PVC |
| `1303` | IGLO ENERGY  - Entrance doors | Entrance Door | PVC |
| `1304` | IGLO ENERGY  - Entrance doors Corner | Entrance Door | PVC |
| `1308` | IGLO ENERGY  - Corner | Corner Window / Door | PVC |
| `1309` | IGLO ENERGY - sets | Window / Door | PVC |
| `1310` | IGLO ENERGY CLASSIC - WINDOWS | Window | PVC |
| `1311` | IGLO ENERGY CLASSIC - PSK | Sliding Door / HST | PVC |
| `1318` | IGLO ENERGY CLASSIC - Corner | Corner Window / Door | PVC |
| `1319` | IGLO ENERGY CLASSIC - SETS | Window / Door | PVC |
| `1320` | IGLO ENERGY RENO - WINDOWS | Window | PVC |
| `1322` | IGLO ENERGY RENO - PROFIL POŚREDNI | Profile Component | PVC |
| `1323` | IGLO ENERGY RENO - Entrance doors | Entrance Door | PVC |
| `1324` | IGLO ENERGY RENO - Entrance doors Corner | Entrance Door | PVC |
| `1328` | IGLO ENERGY RENO - Corner | Corner Window / Door | PVC |
| `1329` | IGLO ENERGY RENO - sets ??? | Window / Door | PVC |
| `1330` | IGLO ENERGY CLASSIC RENO - windows | Window | PVC |
| `1338` | IGLO ENERGY CLASSIC RENO - Corner | Corner Window / Door | PVC |
| `1339` | IGLO ENERGY CLASSIC RENO - sets ??? | Window / Door | PVC |
| `1340` | IGLO ENERGY ADAPT - windows | Window | PVC |
| `1341` | IGLO ENERGY ADAPT - PSK | Sliding Door / HST | PVC |
| `1342` | IGLO ENERGY ADAPT - PROFIL POŚREDNI | Profile Component | PVC |
| `1343` | IGLO ENERGY ADAPT - door | Entrance Door | PVC |
| `1344` | IGLO ENERGY ADAPT - door Corner | Entrance Door | PVC |
| `1348` | IGLO ENERGY ADAPT - Corner | Corner Window / Door | PVC |
| `1349` | IGLO ENERGY ADAPT - ZESTAWY | Window / Door | PVC |
| `1350` | IGLO ENERGY CLASSIC ADAPT - windows | Window | PVC |
| `1351` | IGLO ENERGY CLASSIC ADAPT - PSK | Sliding Door / HST | PVC |
| `1358` | IGLO ENERGY CLASSIC ADAPT - Corner | Corner Window / Door | PVC |
| `1359` | IGLO ENERGY CLASSIC ADAPT -  ZESTAWY | Window / Door | PVC |
| `1360` | IGLO ENERGY ALUCOVER - windows | Window | PVC |
| `1361` | IGLO ENERGY ALUCOVER - PSK | Sliding Door / HST | PVC |
| `1368` | IGLO ENERGY ALUCOVER - Corner | Corner Window / Door | PVC |
| `1369` | IGLO ENERGY ALUCOVER - sets | Window / Door | PVC |
| `1370` | IGLO ENERGY ALUCOVER RENO - windows | Window | PVC |
| `1371` | IGLO ENERGY ALUCOVER RENO - PSK | Sliding Door / HST | PVC |
| `1378` | IGLO ENERGY ALUCOVER RENO - NAROZNIK | Corner Window / Door | PVC |
| `1379` | IGLO ENERGY ALUCOVER RENO - sets | Window / Door | PVC |
| `1380` | IGLO ENERGY ALUCOVER ADAPT - windows | Window | PVC |
| `1381` | IGLO ENERGY ALUCOVER ADAPT - PSK | Sliding Door / HST | PVC |
| `1388` | IGLO ENERGY ALUCOVER ADAPT - Corner | Corner Window / Door | PVC |
| `1389` | IGLO ENERGY ALUCOVER ADAPT - ZESTAWY | Window / Door | PVC |
| `1400` | IGLO EXT - windows | Window | PVC |
| `1409` | IGLO EXT - sets | Window / Door | PVC |
| `1420` | IGLO EXT RENO - windows | Window | PVC |
| `1440` | IGLO EXT ADAPT - windows | Window | PVC |
| `1500` | IGLO PREMIER - windows | Window | PVC |
| `1509` | IGLO PREMIER - sets | Window / Door | PVC |
| `1520` | IGLO PREMIER RENO - windows | Window | PVC |
| `1540` | IGLO PREMIER ADAPT - windows | Window | PVC |
| `1600` | IGLO EDGE - WINDOWS | Window | PVC |
| `1601` | IGLO EDGE  - PSK | Sliding Door / HST | PVC |
| `1602` | IGLO EDGE  - PROFIL POŚREDNI | Profile Component | PVC |
| `1603` | IGLO EDGE - ENTRANCE DOORS | Entrance Door | PVC |
| `1608` | IGLO EDGE - CORNER | Corner Window / Door | PVC |
| `1609` | IGLO EDGE - SETS | Window / Door | PVC |
| `1620` | IGLO EDGE RENO | Window / Door | PVC |
| `1623` | IGLO EDGE RENO - DRZWI WEJŚCIOWE | Entrance Door | PVC |
| `1629` | IGLO EDGE RENO - ZESTAWY | Window / Door | PVC |
| `1700` | NEO 76 AD | Window / Door | PVC |
| `1701` | NEO 76 AD - PSK | Sliding Door / HST | PVC |
| `1702` | NEO 76 AD - PROFIL POŚREDNI | Profile Component | PVC |
| `1703` | NEO 76 AD - DRZWI WEJŚCIOWE | Entrance Door | PVC |
| `1704` | NEO 76 AD - DRZWI WEJŚCIOWE - NAROŻNIK | Entrance Door | PVC |
| `1705` | NEO 76 AD - PROFIL POŚREDNI PSK | Sliding Door / HST | PVC |
| `1708` | NEO 76 AD - NAROŻNIK | Window / Door | PVC |
| `1709` | NEO 76 AD - ZESTAWY | Window / Door | PVC |
| `1710` | NEO 76 MD | Window / Door | PVC |
| `1711` | NEO 76 MD - PSK | Sliding Door / HST | PVC |
| `1712` | NEO 76 MD - PROFIL POŚREDNI | Profile Component | PVC |
| `1713` | NEO 76 MD - FRONT DOOR | Entrance Door | PVC |
| `1714` | NEO 76 MD - DRZWI WEJŚCIOWE - NAROŻNIK | Entrance Door | PVC |
| `1715` | NEO 76 MD - PROFIL POŚREDNI PSK | Sliding Door / HST | PVC |
| `1718` | NEO 76 MD - NAROŻNIK | Window / Door | PVC |
| `1719` | NEO 76 MD - ZESTAWY | Window / Door | PVC |
| `1720` | NEO 76 MD RENO | Window / Door | PVC |
| `1721` | NEO 76 MD RENO - PSK | Sliding Door / HST | PVC |
| `1722` | NEO 76 MD RENO - PROFIL POŚREDNI | Profile Component | PVC |
| `1723` | NEO 76 MD RENO - DRZWI WEJŚCIOWE | Entrance Door | PVC |
| `1724` | NEO 76 MD RENO - DRZWI WEJŚCIOWE - NAROŻNIK | Entrance Door | PVC |
| `1725` | NEO 76 MD RENO - PROFIL POŚREDNI PSK | Sliding Door / HST | PVC |
| `1728` | NEO 76 MD RENO - NAROŻNIK | Window / Door | PVC |
| `1729` | NEO 76 MD RENO - ZESTAWY | Window / Door | PVC |
| `1730` | NEO 76 MD MONO | Window / Door | PVC |
| `1731` | NEO 76 MD MONO - PSK | Sliding Door / HST | PVC |
| `1732` | NEO 76 MD MONO - PROFIL POŚREDNI | Profile Component | PVC |
| `1733` | NEO 76 MD MONO - DRZWI WEJŚCIOWE | Entrance Door | PVC |
| `1734` | NEO 76 MD MONO - DRZWI WEJŚCIOWE - NAROŻNIK | Entrance Door | PVC |
| `1735` | NEO 76 MD MONO - PROFIL POŚREDNI PSK | Sliding Door / HST | PVC |
| `1738` | NEO 76 MD MONO - NAROŻNIK | Window / Door | PVC |
| `1739` | NEO 76 MD MONO - ZESTAWY | Window / Door | PVC |
| `1750` | IDEAL 7000 NL | Window / Door | PVC |
| `1751` | IDEAL 7000 NL - PSK | Sliding Door / HST | PVC |
| `1752` | IDEAL 7000 NL - PROFIL POŚREDNI | Profile Component | PVC |
| `1753` | IDEAL 7000 NL - DRZWI WEJŚCIOWE | Entrance Door | PVC |
| `1754` | IDEAL 7000 NL - DRZWI WEJŚCIOWE - NAROŻNIK | Entrance Door | PVC |
| `1755` | IDEAL 7000 NL - PROFIL POŚREDNI PSK | Sliding Door / HST | PVC |
| `1756` | IDEAL 7000 NL - OKNA OTW NA ZEWN | Window / Door | PVC |
| `1758` | IDEAL 7000 NL - NAROŻNIK | Window / Door | PVC |
| `1759` | IDEAL 7000 NL - ZESTAWY | Window / Door | PVC |
| `1990` | GLASS BALUSTRADE | Window / Door | Aluminium |
| `2000` | ===== WOOD ========================== | Window / Door | Wood / System |
| `2100` | SOFTLINE68 windows, balcony doors | Balcony Door | Wood / System |
| `2101` | SOFTLINE68 PSK | Sliding Door / HST | Wood / System |
| `2103` | SOFTLINE68 Entrance doors | Entrance Door | Wood / System |
| `2104` | SOFTLINE68 HS | Sliding Door / HST | Wood / System |
| `2108` | SOFTLINE68 Bifold doors | Window / Door | Wood / System |
| `2109` | SOFTLINE68 sets | Window / Door | Wood / System |
| `2200` | SOFTLINE78 windows, balcony doors | Balcony Door | Wood / System |
| `2201` | SOFTLINE78 PSK | Sliding Door / HST | Wood / System |
| `2203` | SOFTLINE78 Entrance doors | Entrance Door | Wood / System |
| `2204` | SOFTLINE78 HS | Sliding Door / HST | Wood / System |
| `2209` | SOFTLINE78 sets | Window / Door | Wood / System |
| `2300` | SOFTLINE88 windows, balcony doors | Balcony Door | Wood / System |
| `2301` | SOFTLINE88 PSK | Sliding Door / HST | Wood / System |
| `2303` | SOFTLINE88 FRONT DOOR | Entrance Door | Wood / System |
| `2304` | SOFTLINE88 HS | Sliding Door / HST | Wood / System |
| `2309` | SOFTLINE88 sets | Window / Door | Wood / System |
| `2500` | ===== DUOLINE ========================== | Window / Door | Wood / System |
| `2600` | DUOLINE68 windows, balcony doors | Balcony Door | Wood / System |
| `2601` | DUOLINE68 PSK | Sliding Door / HST | Wood / System |
| `2604` | DUOLINE68 HS | Sliding Door / HST | Wood / System |
| `2609` | DUOLINE68 sets | Window / Door | Wood / System |
| `2700` | DUOLINE78 windows, balcony doors | Balcony Door | Wood / System |
| `2701` | DUOLINE 78 PSK | Sliding Door / HST | Wood / System |
| `2704` | DUOLINE78 HS | Sliding Door / HST | Wood / System |
| `2709` | DUOLINE78 sets | Window / Door | Wood / System |
| `2800` | DUOLINE88 windows, balcony doors | Balcony Door | Wood / System |
| `2804` | DUOLINE88 HS | Sliding Door / HST | Wood / System |
| `2809` | DUOLINE88 sets | Window / Door | Wood / System |
| `3000` | ===== ALU ========================== | Window / Door | Aluminium |
| `3100` | MB45 windows, balcony doors | Balcony Door | Aluminium |
| `3102` | MB45 swing doors | Window / Door | Aluminium |
| `3103` | MB45 door | Entrance Door | Aluminium |
| `3104` | MB45 door - Corner | Entrance Door | Aluminium |
| `3105` | MB45 door with fanlight | Entrance Door | Aluminium |
| `3106` | MB45 sliding windows RĘCZNIE NA BOK | Sliding Door / HST | Aluminium |
| `3107` | MB45 sliding windows RĘCZNIE DO GÓRY | Sliding Door / HST | Aluminium |
| `3108` | MB45 windows, balcony doors - Corner | Balcony Door | Aluminium |
| `3109` | MB45 sets | Window / Door | Aluminium |
| `3150` | MB70 windows, balcony doors | Balcony Door | Aluminium |
| `3151` | MB70 PSK | Sliding Door / HST | Aluminium |
| `3153` | MB70 door | Entrance Door | Aluminium |
| `3155` | MB70 door with fanlight | Entrance Door | Aluminium |
| `3159` | MB70 sets | Window / Door | Aluminium |
| `3200` | MB79N Windows, balcony doors | Balcony Door | Aluminium |
| `3201` | MB79N PSK | Sliding Door / HST | Aluminium |
| `3203` | MB79N Door | Entrance Door | Aluminium |
| `3204` | MB79 SI door - Corner | Entrance Door | Aluminium |
| `3205` | MB79N Door with sidelite | Entrance Door | Aluminium |
| `3208` | MB79 SI windows, balcony doors - Corner | Balcony Door | Aluminium |
| `3209` | MB79N Sets | Window / Door | Aluminium |
| `3240` | MB79N ADAPT | Window / Door | Aluminium |
| `3249` | MB79N ADAPT ZESTAWY | Window / Door | Aluminium |
| `3270` | MB79 SI renovation windows, balcony doors | Balcony Door | Aluminium |
| `3271` | MB79NR RENOWACJA PSK | Sliding Door / HST | Aluminium |
| `3273` | MB79N RENOWACJA DRZWI | Entrance Door | Aluminium |
| `3275` | MB79N RENOWACJA DRZWI Z NAŚWIETLEM | Entrance Door | Aluminium |
| `3278` | MB79 SI RENOVATION OF WINDOWS, BALCONY DOORS - CORNER | Balcony Door | Aluminium |
| `3279` | MB79N RENOWACJA ZESTAWY | Window / Door | Aluminium |
| `3300` | MB86 SI windows, balcony doors | Balcony Door | Aluminium |
| `3301` | MB86 SI PSK | Sliding Door / HST | Aluminium |
| `3303` | MB86 SI door | Entrance Door | Aluminium |
| `3305` | MB86 SI door with fanlight | Entrance Door | Aluminium |
| `3309` | MB86 SI sets | Window / Door | Aluminium |
| `3320` | MB86 SI renovation windows, balcony doors | Balcony Door | Aluminium |
| `3350` | MB86N SI windows, balcony doors | Balcony Door | Aluminium |
| `3351` | MB86N SI PSK | Sliding Door / HST | Aluminium |
| `3353` | MB86N SI door | Entrance Door | Aluminium |
| `3354` | MB86N SI door - Corner | Entrance Door | Aluminium |
| `3355` | MB86N SI door with fanlight | Entrance Door | Aluminium |
| `3358` | MB86N SI windows, balcony doors - Corner | Balcony Door | Aluminium |
| `3359` | MB86N SI sets | Window / Door | Aluminium |
| `3370` | MB86N SI renovation windows, balcony doors | Balcony Door | Aluminium |
| `3378` | MB86N SI renovation windows, balcony doors - Corner | Balcony Door | Aluminium |
| `3400` | GENESIS windows, balcony doors | Balcony Door | Aluminium |
| `3401` | GENESIS PSK | Sliding Door / HST | Aluminium |
| `3403` | GENESIS door | Entrance Door | Aluminium |
| `3405` | GENESIS door with fanlight | Entrance Door | Aluminium |
| `3409` | GENESIS sets | Window / Door | Aluminium |
| `3450` | MB86N PIVOT DOOR | Entrance Door | Aluminium |
| `3453` | MB86N PIVOT DRZWI | Entrance Door | Aluminium |
| `3455` | MB86N PIVOT DRZWI Z NAŚWIETLEM | Entrance Door | Aluminium |
| `3500` | STAR windows, balcony doors | Balcony Door | Aluminium |
| `3501` | STAR PSK | Sliding Door / HST | Aluminium |
| `3503` | STAR door | Entrance Door | Aluminium |
| `3505` | STAR door with fanlight | Entrance Door | Aluminium |
| `3509` | STAR sets | Window / Door | Aluminium |
| `3600` | MB78 EI30 Window | Window | Aluminium |
| `3603` | MB78 EI30 door | Entrance Door | Aluminium |
| `3605` | MB78 EI30 DRZWI Z NAŚWIETLEM | Entrance Door | Aluminium |
| `3609` | MB78 EI30 sets | Window / Door | Aluminium |
| `3650` | MB60 EI30 OKNO | Window | Aluminium |
| `3653` | MB60 EI30 DRZWI | Entrance Door | Aluminium |
| `3659` | MB60 EI30 ZESTAWY | Window / Door | Aluminium |
| `3700` | MB78 EI60 Window | Window | Aluminium |
| `3703` | MB78 EI60 door | Entrance Door | Aluminium |
| `3705` | MB78 EI60 DRZWI Z NAŚWIETLEM | Entrance Door | Aluminium |
| `3709` | MB78 EI60 sets | Window / Door | Aluminium |
| `3804` | MB77 HS(HI) | Sliding Door / HST | Aluminium |
| `3805` | MB77 HS(HI) - Corner | Sliding Door / HST | Aluminium |
| `3814` | MB SLIDE | Sliding Door | Aluminium |
| `3815` | MB SLIDE - Corner | Sliding Door | Aluminium |
| `3824` | SLIDE GLASS | Sliding Door | Aluminium |
| `3854` | MB77 HS(HI) MONORAIL | Sliding Door / HST | Aluminium |
| `3855` | MB77 HS(HI) MONORAIL - NAROZNIK | Sliding Door / HST | Aluminium |
| `3900` | MB59S - Automatically slide doors | Sliding Door | Aluminium |
| `3904` | COR VISION PLUS | Window / Door | Aluminium |
| `3908` | MB86 FOLD LINE (Bifold doors) | Window / Door | Aluminium |
| `3909` | MB86 FOLD LINE HD (Bifold doors) | Window / Door | Aluminium |
| `3910` | MB86 FOLD LINE HD (Bifold doors) - Corner | Corner Window / Door | Aluminium |
| `3950` | MB45- Automatically slide doors | Sliding Door | Aluminium |
| `3960` | MB79N  Automatically slide doors | Sliding Door | Aluminium |
| `3990` | MB-GLASS BARRIER | Window / Door | Aluminium |
| `4000` | ===== Roller shutter ========================== | Roller Shutter | Wood / System |
| `4001` | Outdoor shutters | Roller Shutter | PVC |
| `4002` | Kolor listwy dolnej moskitiery RN_175 ELITE | Mosquito Screen | PVC |
| `4009` | Kolor skrzynek RA45_205 | Window / Door | PVC |
| `4010` | Kolory siatki moskitiery | Mosquito Screen | PVC |
| `4011` | Curtain color 37 | Window / Door | PVC |
| `4012` | Curtain color 42 | Window / Door | PVC |
| `4013` | Curtain color 55 | Window / Door | PVC |
| `4014` | Colour guides aluminiowych to roller shutters RS standard | Roller Shutter | PVC |
| `4015` | Colour guides aluminiowych to roller shutters RS non-standar | Roller Shutter | PVC |
| `4016` | Colour guides aluminiowych to roller shutters RA | Roller Shutter | PVC |
| `4017` | Colour guides PVC to roller shutters | Roller Shutter | PVC |
| `4018` | Colour listew końcowych armoura standard | Window / Door | PVC |
| `4019` | Colour listew końcowych armoura non-standard | Window / Door | PVC |
| `4020` | Colour zakończeń guides to roller shutters | Roller Shutter | PVC |
| `4021` | Colour skrzynek RA45 | Window / Door | PVC |
| `4022` | Colour skrzynek RAOW | Window / Door | PVC |
| `4023` | Colour skrzynek RA90 | Window / Door | PVC |
| `4024` | Colour skrzynek RN | Window / Door | PVC |
| `4025` | Colour skrzynek RSW/RSZ | Window / Door | PVC |
| `4026` | Colour ANGLEów to roller shutters out (bez RSZ) | Roller Shutter | PVC |
| `4027` | Colour ANGLEów to roller shutters ins | Roller Shutter | PVC |
| `4028` | Colour ANGLEów ALU to roller shutters RSZ | Roller Shutter | PVC |
| `4029` | Colour Bufferów 20mm | Window / Door | PVC |
| `4030` | Colour Bufferów 40mm | Window / Door | PVC |
| `4031` | Colour adapterów RSW 956 / 957 | Window / Door | PVC |
| `4032` | Colour adapterów RSW 969 | Window / Door | PVC |
| `4033` | Kolor zamka baskwilowego | Window / Door | PVC |
| `4034` | Colour guides drewnianych to roller shutters | Roller Shutter | PVC |
| `4035` | Colour bottom slat Mosquito nets RS standard | Window / Door | PVC |
| `4036` | Colour bottom slat Mosquito nets RS non-standard | Window / Door | PVC |
| `4037` | Colour bottom slat Mosquito nets RA/RN standard | Window / Door | PVC |
| `4038` | Colour bottom slat Mosquito nets RA/RN non-standard | Window / Door | PVC |
| `4039` | Colour bottom slat Mosquito nets RN_175 SKS | Window / Door | PVC |
| `4040` | Colour elementów rolet aluminiowych non-standard | Window / Door | PVC |
| `4041` | Colour profilu rewizyjnego RS PVC | Profile Component | PVC |
| `4042` | Colour profilu rewizyjnego RS ALU | Profile Component | PVC |
| `4043` | Colour guides aluminiowych to roller shutters RN | Roller Shutter | PVC |
| `4044` | Kolor lameli do paneli D-Art(panele nakładkowe ELEGANCE MB86 | Window / Door | PVC |
| `4045` | Kolor paneli D-Art (panele nakładkowe MB86N) | Window / Door | PVC |
| `4046` | Kolory pochwytu okrągłego D-Art (panele nakładkowe MB86N) | Window / Door | PVC |
| `4047` | Kolory listwy dolnej D-Art (panele nakładkowe MB86N) | Window / Door | PVC |
| `4048` | Kolor buforów 28mm | Window / Door | PVC |
| `4049` | Kolor zaślepek obudowy bocznej (RN215/225) | Window / Door | PVC |
| `4050` | Kolor zaślepek obudowy bocznej (RN175 SKS) | Window / Door | PVC |
| `4051` | Roller shutter RN bulk (filter) | Roller Shutter | PVC |
| `4052` | Roller shutter RA bulk (filter) | Roller Shutter | PVC |
| `4053` | Roller shutter RSW bulk (filter) | Roller Shutter | PVC |
| `4054` | Roller shutter RSZ bulk (filter) | Roller Shutter | PVC |
| `4055` | Roleta RNV luzem (filtr) | Roller Shutter | PVC |
| `4056` | Roleta RDZ luzem (filtr) | Roller Shutter | PVC |
| `4057` | Kolor panelu PIVOT 8 - VIP Rustico | Window / Door | PVC |
| `4058` | Kolor panelu PIVOT 7 - Industrial Bronze | Window / Door | PVC |
| `4059` | Kolor paneli C - Classic (VP Trend) | Window / Door | PVC |
| `4060` | Kolor paneli L - Lamelowe (VP Trend) | Window / Door | PVC |
| `4061` | Roller shutter RN for window PVC (filter) | Roller Shutter | PVC |
| `4062` | Roller shutter RA for window PVC (filter) | Roller Shutter | PVC |
| `4063` | Roller shutter RSW for window PVC (filter) | Roller Shutter | PVC |
| `4064` | Roller shutter RSZ for window PVC (filter) | Roller Shutter | PVC |
| `4065` | Roleta RNV do okna PVC (filtr) | Roller Shutter | PVC |
| `4071` | Roller shutter RN for window ALU (filter) | Roller Shutter | PVC |
| `4072` | Roller shutter RA for window ALU (filter) | Roller Shutter | PVC |
| `4073` | Roller shutter RSW for window ALU (filter) | Roller Shutter | PVC |
| `4074` | Roller shutter RSZ for window ALU (filter) | Roller Shutter | PVC |
| `4075` | Roleta RNV do okna ALU (filtr) | Roller Shutter | PVC |
| `4081` | Roller shutter RN for window DRE (filter) | Roller Shutter | PVC |
| `4082` | Roller shutter RA for window DRE (filter) | Roller Shutter | PVC |
| `4083` | Roller shutter RSW for window DRE (filter) | Roller Shutter | PVC |
| `4084` | Roller shutter RSZ for window DRE (filter) | Roller Shutter | PVC |
| `4085` | Roleta RNV do okna DRE (filtr) | Roller Shutter | PVC |
| `4091` | Roller shutter RN for window DRA (filter) | Roller Shutter | PVC |
| `4092` | Roller shutter RA for window DRA (filter) | Roller Shutter | PVC |
| `4093` | Roller shutter RSW for window DRA (filter) | Roller Shutter | PVC |
| `4094` | Roller shutter RSZ for window DRA (filter) | Roller Shutter | PVC |
| `4095` | Roleta RNV do okna DRA (filtr) | Roller Shutter | PVC |
| `4098` | Color of the flush-mounted strip (styrofoam clinker) | Window / Door | PVC |
| `4099` | Kolor boków rolet RA90 (malowane) | Window / Door | PVC |
| `4100` | ===== Facade blinds ========================== | Window / Door | PVC |
| `4101` | Facade blinds | Window / Door | PVC |
| `4109` | Żaluzje fasadowe - prowadnice _R | Window / Door | PVC |
| `4110` | Żaluzje fasadowe - prowadnice | Window / Door | PVC |
| `4111` | Slat color C80 | Window / Door | PVC |
| `4115` | Colour guides aluminiowych do venetian blinds ZFA | Window / Door | PVC |
| `4116` | Colour guides aluminiowych do venetian blinds ZFS | Window / Door | PVC |
| `4117` | Colour guides PVC do venetian blinds ZFS | Window / Door | PVC |
| `4120` | Colour zakończeń guides do venetian blinds | Window / Door | PVC |
| `4121` | Colour skrzynek ZFA | Window / Door | PVC |
| `4122` | Colour skrzynek ZFS | Window / Door | PVC |
| `4130` | Colour elementów zabulkji aluminiowych non-standard | Window / Door | PVC |
| `4200` | ===== Cassonetto ========================== | Window / Door | PVC |
| `4201` | Cassonetto | Window / Door | PVC |
| `4250` | ===== Żaluzje Venus ========================== | Window / Door | PVC |
| `4251` | Żaluzje Venus | Window / Door | PVC |
| `4255` | Żaluzje Venus - kolor rynny górnej i obciąznika | Window / Door | PVC |
| `4400` | ===== Insect screen ========================== | Mosquito Screen | PVC |
| `4401` | Pleated insect screen | Mosquito Screen | PVC |
| `4402` | Mosquito nets | Window / Door | PVC |
| `4403` | Moskitiera drzwiowa | Mosquito Screen | PVC |
| `4404` | Moskitiera otwierana - kolory niestandardowe | Mosquito Screen | PVC |
| `4405` | Pleated insect screen Top Zag | Mosquito Screen | PVC |
| `4406` | Pleated insect screen Click-Roll | Mosquito Screen | PVC |
| `4407` | Mosquito Flex-Screen | Window / Door | PVC |
| `5000` | ===== iQuote ========================== | Window / Door | Wood / System |
| `5001` | iQuote - accessories PVC | Window / Door | PVC |
| `5002` | iQuote - accessories DRE | Window / Door | Wood / System |
| `5003` | iQuote - accessories DRA | Window / Door | Wood / System |
| `6050` | Kolor lameli - panele ALU (R_) D101/O102/W645 | Window / Door | Aluminium |
| `6051` | Kolor lameli - panele ALU (R_) RAL/SPEC | Window / Door | Aluminium |
| `8000` | ======== Bramy ================================= | Window / Door | Wood / System |
| `8011` | Garage doors | Garage Door | Wood / System |
| `8012` | Bramy przemysłowe | Window / Door | Wood / System |
| `8101` | Kolory paneli grubość 60 - standardowe | Window / Door | Wood / System |
| `8102` | Kolory paneli grubość 60 - niestandardowe | Window / Door | Wood / System |
| `8112` | Kolory paneli gr 40 Wysokie Woodgrain - standardowe | Window / Door | Wood / System |
| `8113` | Kolory paneli gr 40 Niskie Woodgrain - standardowe | Window / Door | Wood / System |
| `8114` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain - standardowe | Window / Door | Wood / System |
| `8115` | Kolory paneli gr 40 Wysokie Woodgrain - niestandardowe | Window / Door | Wood / System |
| `8116` | Kolory paneli gr 40 Niskie Woodgrain - niestandardowe | Window / Door | Wood / System |
| `8117` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain-niestandardowe | Window / Door | Wood / System |
| `8122` | Kolory paneli gr 40 Wysokie Gladkie - standardowe | Window / Door | Wood / System |
| `8123` | Kolory paneli gr 40 Niskie Gładkie - standardowe | Window / Door | Wood / System |
| `8124` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - standardowe | Window / Door | Wood / System |
| `8125` | Kolory paneli gr 40 Wysokie Gladkie - niestandardowe | Window / Door | Wood / System |
| `8126` | Kolory paneli gr 40 Niskie Gładkie - niestandardowe | Window / Door | Wood / System |
| `8127` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - niestandardowe | Window / Door | Wood / System |
| `8130` | Kolory paneli struktura wew | Window / Door | Wood / System |
| `8131` | Kolory prowadnic/ościeżnic - Bramy standard | Window / Door | Wood / System |
| `8132` | Kolory okien - Bramy | Window / Door | Wood / System |
| `8133` | Kolory okien stal nierdzewna- Bramy | Window / Door | Wood / System |
| `8135` | Kolory kratek wentylacyjnych - Bramy | Window / Door | Wood / System |
| `8136` | Kolory okien czarny- Bramy | Window / Door | Wood / System |
| `8137` | Kolory okien biały- Bramy | Window / Door | Wood / System |
| `8138` | Kolory okien aluminium- Bramy | Window / Door | Wood / System |
| `8139` | Kolory prowadnic/ościeżnic - Bramy renowacja | Window / Door | Wood / System |
| `8140` | Kolory podwieszeń bramy | Window / Door | Wood / System |
| `8145` | Kolory zawiasów/okuć | Window / Door | Wood / System |
| `8150` | Type of glazing window M1 - gate | Window | Wood / System |
| `8151` | Type of glazing window P6,K2,O2,P4,P3,P2 - gate | Window | Wood / System |
| `8200` | Przetłoczenia gr. 40 | Window / Door | Wood / System |
| `8201` | Przetłoczenia gr. 60 | Window / Door | Wood / System |
| `8205` | Grubość paneli 40mm | Window / Door | Wood / System |
| `8206` | Grubość paneli 60mm | Window / Door | Wood / System |
| `10001` | packaging - Type 1 | Window / Door | Wood / System |
| `10002` | packaging - Type 2 | Window / Door | Wood / System |
| `10028` | Colour klamek EXT | Window / Door | PVC |
| `10320` | Gluing the glazing unit in the sash | Window / Door | PVC |
| `10321` | Gluing the glazing unit in the fix | Window / Door | PVC |
| `10322` | Gluing the glazing unit in the RC2 fix | Window / Door | PVC |
| `10323` | Gluing the package in the passive sash on the handle side | Window / Door | PVC |
| `10350` | Kolory - wrzutka na listy do wypełnień GAVA88001 | Window / Door | PVC |
| `10351` | Kolory - wrzutka na listy do wypełnień SW-02 | Window / Door | PVC |
| `10400` | Kolor drzwi dla pupila (filtr) - biale | Entrance Door | PVC |
| `10401` | Kolor drzwi dla pupila (filtr) - biale,braz | Entrance Door | PVC |
| `10402` | Kolor drzwi dla pupila (filtr) - biale,braz,antracyt | Entrance Door | PVC |
| `10801` | stick-on grills | Window / Door | PVC |
| `10803` | stick-on grills ALU | Window / Door | Aluminium |
| `11600` | Filtr - kolor aplikacji - panel | Window / Door | Aluminium |
| `11601` | Filtr - kolor ramki ozdobnej - panel | Window / Door | Aluminium |
| `11602` | Filtr - kolor profilu ozdobnego pochwytu - panel | Profile Component | Aluminium |
| `11603` | Filtr - kolor aplikacji - panel PIVOT 3 | Window / Door | Aluminium |
| `11604` | Filtr - kolor aplikacji (Ral 9005 mat)- panel PIVOT 7 | Window / Door | Aluminium |
| `11605` | Filtr - kolor systemowy (właściwość 1100 fitr) panel PIVOT 8 | Window / Door | Aluminium |
| `11606` | Filtr - kolor aplikacji panel PIVOT 8 - (VIP Amber) | Window / Door | Aluminium |
| `15015` | Colour aplikacji woodpodobnej - PANELE | Window / Door | Wood / System |
| `15017` | Kolory ramki paneli drewnianych D-ART | Window / Door | Wood / System |
| `15018` | Kolory aplikacji panele ALU (R_) D101/O102/W645 | Window / Door | Aluminium |
| `15019` | Kolory aplikacji panele ALU (R_) RAL/SPEC | Window / Door | Aluminium |
| `15031` | Piaskowania Type 1 (do szyb squareowych) | Window / Door | PVC |
| `15032` | Piaskowania Type 2 (do szyb prostoAnglenych) | Window / Door | PVC |
| `15035` | Piaskowania typ dx_32 | Window / Door | PVC |
| `15036` | Piaskowania typ dx_33 | Window / Door | PVC |
| `15037` | Piaskowania typ dx_34 | Window / Door | PVC |
| `15038` | Piaskowania typ dx_35 | Window / Door | PVC |
| `90` | virtual Type dla single sidedek | Window / Door | Wood / System |
| `99` | NieVisible, ale można wprowadzić znając Number artykułu | Window / Door | Wood / System |
| `999` | virtual Type nie pasujący do niczego, ale nie jest to 99 | Window / Door | Wood / System |
| `6001` | ALU - Extensions PVC to ALU | Window / Door | Aluminium |
| `9000` | ===== Glas ========================== | Window / Door | Wood / System |
| `9999` | Glass | Window / Door | PVC |
| `10000` | ===> FILTER <======================== | Window / Door | Wood / System |
| `10011` | PVC - handle malowane | Window / Door | PVC |
| `10012` | PVC - Hoppe handle | Window / Door | PVC |
| `10013` | PVC - Hoppe handle TOULON, HAMBURG | Window / Door | PVC |
| `10015` | PVC - handle PZ malowane | Window / Door | PVC |
| `10017` | PVC - handle PSK sterowanie ręczne | Sliding Door / HST | PVC |
| `10018` | PVC - handle PSK sterowanie automatyczne | Sliding Door / HST | PVC |
| `10019` | PVC - HS handleT | Sliding Door / HST | PVC |
| `10020` | Filter - handle FS sash czynne | Window / Door | PVC |
| `10021` | Filter - handle FS passive sash | Window / Door | PVC |
| `10022` | PVC - Colour zaslepek odwodnien | Window / Door | PVC |
| `10023` | PVC - Colour profilu bazowego | Profile Component | PVC |
| `10024` | PVC - Color of the knob for the rigid chain | Window / Door | PVC |
| `10025` | Colour Mountów do Latchów Balcony doorowych | Balcony Door | PVC |
| `10026` | Colour blokady turnarcia | Window / Door | PVC |
| `10027` | Colour Multi Vent | Window / Door | PVC |
| `10029` | Kolory blokady rozwarcia ALU | Window / Door | Aluminium |
| `10030` | PVC - Artykuły w Colourach podst.: white / brown | Window / Door | PVC |
| `10033` | PVC - Artykuły w kolorach podst.: czarny | Window / Door | PVC |
| `10031` | PVC - Artykuły w Colourach podst.: white / veneer | Window / Door | PVC |
| `10032` | Kolory uchwytów do zatrzasków balkonowych DeLuxe | Balcony Door | PVC |
| `10034` | PVC - Kolory zaslepek odwodnien monoblock | Window / Door | PVC |
| `10040` | Colour farb Azure | Window / Door | Wood / System |
| `10041` | Colour farb RAL bez wskazania struktury | Window / Door | Aluminium |
| `10042` | Colour farb RAL ze wskazaniem struktury | Window / Door | Aluminium |
| `10050` | Colour progów HST HH.. | Sliding Door / HST | PVC |
| `10051` | Colour progów for windows | Window | PVC |
| `10052` | Colour progów HST EcoPass | Sliding Door / HST | PVC |
| `10060` | Colour bumperów HST | Sliding Door / HST | PVC |
| `10061` | Colour akcesoriów HST | Sliding Door / HST | PVC |
| `10062` | Colour profili bez uszczelek HST | Sliding Door / HST | PVC |
| `10070` | Colour zaślepek movable post V70,V82,A70 | Window / Door | PVC |
| `10071` | Colour zaślepek movable post V90 | Window / Door | PVC |
| `10080` | Colour otwieraczy naświetli | Window / Door | PVC |
| `10081` | Colour otwieraczy naświetli (FLEXIBLE CABLE) | Window / Door | PVC |
| `10082` | Kolory otwieraczy naświetli FL190 (CIĘGNO GIĘTKIE) | Window / Door | PVC |
| `10083` | Kolory otwieraczy naświetli FL190 (KORBA) | Window / Door | PVC |
| `10084` | Kolory otwieraczy naświetli FL190 | Window / Door | PVC |
| `10085` | Colour Sillów insnetrznych | Window / Door | PVC |
| `10100` | Colour Grillów 8mm | Window / Door | PVC |
| `10101` | Colour Grillów 18mm | Window / Door | PVC |
| `10102` | Colour Grillów 26mm | Window / Door | PVC |
| `10103` | Colour Grillów 45mm | Window / Door | PVC |
| `10104` | Colour osłonek FS ALU | Window / Door | Aluminium |
| `10105` | Colour nakładek ALU | Window / Door | Aluminium |
| `10106` | Colour Ventilationów RENSON PVC | Window / Door | PVC |
| `10107` | Colour Ventilationów RENSON ALU | Window / Door | Aluminium |
| `10108` | Ventilations downdrafts RADAKS/REGEL | Window / Door | PVC |
| `10109` | AMO ventilation colour -standard | Window / Door | PVC |
| `10110` | AERECO ventilation colour -standard | Window / Door | PVC |
| `10111` | Colour Ventilationów VENTEC standard | Window / Door | PVC |
| `10112` | Colour okapów under the roller shutter for ventilation AMO | Roller Shutter | PVC |
| `10113` | Colour Ventilationów VENTAIR standard | Window / Door | PVC |
| `10114` | BROOKVENT 1 ventilation colour -standard | Window / Door | PVC |
| `10115` | BROOKVENT 2 ventilation colour -non-standard | Window / Door | PVC |
| `10116` | BROOKVENT 4 ventilation colour -standard | Window / Door | PVC |
| `10117` | Colour Ventilationów BROOKVENT 4 standard | Window / Door | PVC |
| `10118` | Colour Ventilationów ZUROH | Window / Door | PVC |
| `10120` | Colour osłonek - Palette podstawowa | Window / Door | PVC |
| `10121` | Colour osłonek - Palette turnidthzona | Window / Door | PVC |
| `10122` | Colour osłonek - hingey budowlane | Window / Door | PVC |
| `10123` | Colour pochwycików | Window / Door | PVC |
| `10124` | Colour osłonek - PSK (PVC) | Sliding Door / HST | PVC |
| `10125` | Colour hingeów EXT | Window / Door | PVC |
| `10126` | Colour osłonek - PSK (ALU) | Sliding Door / HST | PVC |
| `10127` | Kolory osłonek ROTO | Window / Door | PVC |
| `10128` | Kolory osłonek kształt KOŁO - zawiasy HAUTAU | Window / Door | PVC |
| `10129` | AMO ventilation colour -non-standard | Window / Door | PVC |
| `10130` | AERECO ventilation colour -non-standard | Window / Door | PVC |
| `10131` | Colour Ventilationów VENTEC non-standard | Window / Door | PVC |
| `10133` | Colour Ventilationów VENTAIR non-standard | Window / Door | PVC |
| `10134` | BROOKVENT 1 ventilation colour -non-standard | Window / Door | PVC |
| `10135` | BROOKVENT 2 ventilation colour -standard | Window / Door | PVC |
| `10136` | BROOKVENT 3 ventilation colour -non-standard | Window / Door | PVC |
| `10137` | BROOKVENT 4 ventilation colour -non-standard | Window / Door | PVC |
| `10138` | Kolory nawiewników SLIMLINE 2000 | Window / Door | PVC |
| `10211` | Packagey do wypełnień 36mm PVC | Window / Door | PVC |
| `10212` | Packagey do wypełnień 36mm ALU | Window / Door | PVC |
| `10213` | Packagey do wypełnień 77mm ALU | Window / Door | PVC |
| `10214` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | Window / Door | PVC |
| `10215` | Pakiety do wypełnień 24mm PVC | Window / Door | PVC |
| `10216` | Pakiety do wypełnień 48mm PVC | Window / Door | PVC |
| `10217` | Pakiety do wypełnień 23mm ALU | Window / Door | PVC |
| `10218` | Pakiety do wypełnień 35mm ALU | Window / Door | PVC |
| `10219` | Pakiety do wypełnień 47mm ALU | Window / Door | PVC |
| `10220` | Pakiety do wypełnień 77mm ALU do panelu CLASSIC3 | Window / Door | PVC |
| `10221` | Colour pull handle ów M2 for PVC | Window / Door | PVC |
| `10222` | Colour pull handle ów M2 to ALU | Window / Door | PVC |
| `10226` | Pakiety do wypełnień 77mm ALU do panelu MODERN_15_C | Window / Door | PVC |
| `10208` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Lacobel | Window / Door | PVC |
| `10209` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | Window / Door | PVC |
| `10210` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Milk2Line | Window / Door | PVC |
| `10225` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą LacobelLin | Window / Door | PVC |
| `10223` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | Window / Door | PVC |
| `10224` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | Window / Door | PVC |
| `10250` | Pakiety do wypełnień 24mm DRUTEX_C | Window / Door | PVC |
| `10251` | Pakiety do wypełnień 36mm DRUTEX_C | Window / Door | PVC |
| `10252` | Pakiety do wypełnień 48mm DRUTEX_C | Window / Door | PVC |
| `10260` | Pakiety do wypełnień 28mm DRUTEX_DRE | Window / Door | PVC |
| `10261` | Pakiety do wypełnień 40mm DRUTEX_DRE | Window / Door | PVC |
| `10262` | Pakiety do wypełnień 48mm DRUTEX_DRE | Window / Door | PVC |
| `10290` | Ramki międzyszybowe do paneli drutex | Window / Door | PVC |
| `10291` | Ramki międzyszybowe do paneli VPTrend | Window / Door | PVC |
| `10300` | Color Self-closer Geze TS2000 | Window / Door | PVC |
| `10301` | Color Self-closer Geze TS4000 | Window / Door | PVC |
| `10302` | Color Self-closer DORMA TS PROFIL | Profile Component | PVC |
| `10303` | DORMA TS 93 self-closer colour | Window / Door | PVC |
| `10304` | Color Self-closer Geze TS5000 | Window / Door | PVC |
| `10600` | DZ- handle OUTSIDE | Window / Door | PVC |
| `10603` | DZ- handle H6S26 OUTSIDE | Window / Door | Aluminium |
| `10650` | Kolory ramki przyszybowej paneli | Window / Door | PVC |
| `10601` | TZ- handle tarasowe OUTSIDE | Balcony Door | PVC |
| `10602` | DZ - Rozety OUTSIDE | Window / Door | PVC |
| `10632` | DZ - Rozety zewnątrz ALU | Window / Door | PVC |
| `10605` | DZ- pull handle y | Window / Door | PVC |
| `10610` | DZ - handle Inside | Window / Door | PVC |
| `10612` | DZ - Rozety Inside | Window / Door | PVC |
| `10642` | DZ - Rozety wewnątrz ALU | Window / Door | PVC |
| `10613` | DZ - handle H6S26 Inside | Window / Door | Aluminium |
| `10615` | DZ - hingey doorowe | Window / Door | PVC |
| `10617` | DZ - hingey doorowe ALU | Window / Door | Aluminium |
| `10618` | DZ - Door plate  Type 33 PZ BLACK anode | Entrance Door | Aluminium |
| `10616` | DZ - hingey doorowe DRE | Window / Door | Wood / System |
| `10619` | DZ - Zawiasy drzwiowe JOCKER / Rolkowe | Entrance Door | PVC |
| `10620` | DZ - Rozety SATURN | Window / Door | PVC |
| `10621` | DZ - Zawiasy drzwiowe DR.HAHN | Entrance Door | PVC |
| `10622` | DZ - Zawiasy drzwiowe DR.HAHN (ale nie w NL7000) | Entrance Door | PVC |
| `10702` | Glazing beads PVC | Window / Door | PVC |
| `10703` | Listwy przyszybowe PVC - Aluplast | Window / Door | PVC |
| `10711` | Glazing beads wood | Window / Door | Wood / System |
| `10712` | Glazing beads WOOD 78 | Window / Door | Wood / System |
| `10713` | Glazing beads WOOD 88 | Window / Door | Wood / System |
| `10715` | Listwy przyszybowe DUOLINE 68 | Window / Door | Wood / System |
| `10716` | Listwy przyszybowe DUOLINE 78 | Window / Door | Wood / System |
| `10717` | Listwy przyszybowe DUOLINE 88 | Window / Door | Wood / System |
| `10720` | Glazing beads/profile dodatkowe ALU | Profile Component | Aluminium |
| `10802` | stick-on grills VEKA | Window / Door | PVC |
| `10902` | Silly VEKA | Window / Door | PVC |
| `10905` | Silly aluminiowe | Window / Door | PVC |
| `10911` | Silly Drewniane | Window / Door | Wood / System |
| `11022` | ALU - Colour zaslepek odwodnien | Window / Door | Aluminium |
| `11023` | ALU - Kolory zaslepek odwodnien - Cor Vision Plus | Window / Door | Aluminium |
| `11050` | ALU - HS pull handle color | Sliding Door / HST | Aluminium |
| `11121` | Colour osłonek - Palette turnidthzona | Window / Door | Aluminium |
| `11250` | Color of ventilation sleeves for ALU | Window / Door | Aluminium |
| `15001` | Wzory piaskowań | Window / Door | PVC |
| `15010` | Wypełnienia Drutex PVC | Window / Door | PVC |
| `15016` | Wypełnienia DRUTEX DRE (3D_WOOD_1) | Window / Door | PVC |
| `15020` | PŁyty sandwich PVC | Window / Door | PVC |
| `15021` | PŁyty sandwich ALU | Window / Door | PVC |
| `15022` | PŁyty sandwich PVC | Window / Door | PVC |
| `15024` | Wypełnienia DRUTEX DRE (bez 3D_WOOD_1) | Window / Door | PVC |
| `15100` | Wypełnienia DRUTEX PVC - grubość wypełnienia 36,48 | Window / Door | PVC |
| `15011` | Wypełnienia Drutex ALU | Window / Door | PVC |
| `15012` | Wypełnienia Drutex ALU only Cap | Window / Door | PVC |
| `15013` | KN infills | Window / Door | PVC |
| `15014` | Wypełnienia DRUTEX L (LAMELE) | Window / Door | PVC |
| `15025` | Wypełnienia DRUTEX ALU ADEK-ADEK/ADEK-ARAL | Window / Door | Aluminium |
| `15026` | Wypełnienia DRUTEX ALU BEZ(ADEK-ADEK/ADEK-ARAL) | Window / Door | Aluminium |
| `16000` | Colour akcesorii do ecosol70 | Window / Door | PVC |
| `19000` | =====WOODWORK======== | Window / Door | Wood / System |
| `19010` | Colour Drip capów alu Gutmann | Window / Door | Wood / System |
| `19011` | Sandwich panel / boazeryjne DRE | Window / Door | Wood / System |
| `19012` | Panele sandwich / boazeryjne DRA | Window / Door | Wood / System |
| `19020` | Colour Siliconeu | Window / Door | Wood / System |
| `19600` | DZ- handle OUTSIDE | Window / Door | Wood / System |
| `19602` | DZ - Rozety OUTSIDE | Window / Door | Wood / System |
| `19610` | DZ - handle Inside | Window / Door | Wood / System |
| `19612` | DZ - Rozety Inside | Window / Door | Wood / System |
| `19615` | DZ - hingey doorowe | Window / Door | PVC |

---

## Grouped by Material

### Aluminium

| Code | Description | Profile System | Product Type |
|------|-------------|----------------|--------------|
| `1990` | GLASS BALUSTRADE | `—` → — | Window / Door |
| `3000` | ===== ALU ========================== | `—` → — | Window / Door |
| `3100` | MB45 windows, balcony doors | `—` → — | Balcony Door |
| `3102` | MB45 swing doors | `—` → — | Window / Door |
| `3103` | MB45 door | `—` → — | Entrance Door |
| `3104` | MB45 door - Corner | `—` → — | Entrance Door |
| `3105` | MB45 door with fanlight | `—` → — | Entrance Door |
| `3106` | MB45 sliding windows RĘCZNIE NA BOK | `—` → — | Sliding Door / HST |
| `3107` | MB45 sliding windows RĘCZNIE DO GÓRY | `—` → — | Sliding Door / HST |
| `3108` | MB45 windows, balcony doors - Corner | `—` → — | Balcony Door |
| `3109` | MB45 sets | `—` → — | Window / Door |
| `3150` | MB70 windows, balcony doors | `—` → — | Balcony Door |
| `3151` | MB70 PSK | `—` → — | Sliding Door / HST |
| `3153` | MB70 door | `—` → — | Entrance Door |
| `3155` | MB70 door with fanlight | `—` → — | Entrance Door |
| `3159` | MB70 sets | `—` → — | Window / Door |
| `3200` | MB79N Windows, balcony doors | `—` → — | Balcony Door |
| `3201` | MB79N PSK | `—` → — | Sliding Door / HST |
| `3203` | MB79N Door | `—` → — | Entrance Door |
| `3204` | MB79 SI door - Corner | `—` → — | Entrance Door |
| `3205` | MB79N Door with sidelite | `—` → — | Entrance Door |
| `3208` | MB79 SI windows, balcony doors - Corner | `—` → — | Balcony Door |
| `3209` | MB79N Sets | `—` → — | Window / Door |
| `3240` | MB79N ADAPT | `—` → — | Window / Door |
| `3249` | MB79N ADAPT ZESTAWY | `—` → — | Window / Door |
| `3270` | MB79 SI renovation windows, balcony doors | `—` → — | Balcony Door |
| `3271` | MB79NR RENOWACJA PSK | `—` → — | Sliding Door / HST |
| `3273` | MB79N RENOWACJA DRZWI | `—` → — | Entrance Door |
| `3275` | MB79N RENOWACJA DRZWI Z NAŚWIETLEM | `—` → — | Entrance Door |
| `3278` | MB79 SI RENOVATION OF WINDOWS, BALCONY DOORS - CORNER | `—` → — | Balcony Door |
| `3279` | MB79N RENOWACJA ZESTAWY | `—` → — | Window / Door |
| `3300` | MB86 SI windows, balcony doors | `—` → — | Balcony Door |
| `3301` | MB86 SI PSK | `—` → — | Sliding Door / HST |
| `3303` | MB86 SI door | `—` → — | Entrance Door |
| `3305` | MB86 SI door with fanlight | `—` → — | Entrance Door |
| `3309` | MB86 SI sets | `—` → — | Window / Door |
| `3320` | MB86 SI renovation windows, balcony doors | `—` → — | Balcony Door |
| `3350` | MB86N SI windows, balcony doors | `—` → — | Balcony Door |
| `3351` | MB86N SI PSK | `—` → — | Sliding Door / HST |
| `3353` | MB86N SI door | `—` → — | Entrance Door |
| `3354` | MB86N SI door - Corner | `—` → — | Entrance Door |
| `3355` | MB86N SI door with fanlight | `—` → — | Entrance Door |
| `3358` | MB86N SI windows, balcony doors - Corner | `—` → — | Balcony Door |
| `3359` | MB86N SI sets | `—` → — | Window / Door |
| `3370` | MB86N SI renovation windows, balcony doors | `—` → — | Balcony Door |
| `3378` | MB86N SI renovation windows, balcony doors - Corner | `—` → — | Balcony Door |
| `3400` | GENESIS windows, balcony doors | `—` → — | Balcony Door |
| `3401` | GENESIS PSK | `—` → — | Sliding Door / HST |
| `3403` | GENESIS door | `—` → — | Entrance Door |
| `3405` | GENESIS door with fanlight | `—` → — | Entrance Door |
| `3409` | GENESIS sets | `—` → — | Window / Door |
| `3450` | MB86N PIVOT DOOR | `—` → — | Entrance Door |
| `3453` | MB86N PIVOT DRZWI | `—` → — | Entrance Door |
| `3455` | MB86N PIVOT DRZWI Z NAŚWIETLEM | `—` → — | Entrance Door |
| `3500` | STAR windows, balcony doors | `—` → — | Balcony Door |
| `3501` | STAR PSK | `—` → — | Sliding Door / HST |
| `3503` | STAR door | `—` → — | Entrance Door |
| `3505` | STAR door with fanlight | `—` → — | Entrance Door |
| `3509` | STAR sets | `—` → — | Window / Door |
| `3600` | MB78 EI30 Window | `—` → — | Window |
| `3603` | MB78 EI30 door | `—` → — | Entrance Door |
| `3605` | MB78 EI30 DRZWI Z NAŚWIETLEM | `—` → — | Entrance Door |
| `3609` | MB78 EI30 sets | `—` → — | Window / Door |
| `3650` | MB60 EI30 OKNO | `—` → — | Window |
| `3653` | MB60 EI30 DRZWI | `—` → — | Entrance Door |
| `3659` | MB60 EI30 ZESTAWY | `—` → — | Window / Door |
| `3700` | MB78 EI60 Window | `—` → — | Window |
| `3703` | MB78 EI60 door | `—` → — | Entrance Door |
| `3705` | MB78 EI60 DRZWI Z NAŚWIETLEM | `—` → — | Entrance Door |
| `3709` | MB78 EI60 sets | `—` → — | Window / Door |
| `3804` | MB77 HS(HI) | `—` → — | Sliding Door / HST |
| `3805` | MB77 HS(HI) - Corner | `—` → — | Sliding Door / HST |
| `3814` | MB SLIDE | `—` → — | Sliding Door |
| `3815` | MB SLIDE - Corner | `—` → — | Sliding Door |
| `3824` | SLIDE GLASS | `—` → — | Sliding Door |
| `3854` | MB77 HS(HI) MONORAIL | `—` → — | Sliding Door / HST |
| `3855` | MB77 HS(HI) MONORAIL - NAROZNIK | `—` → — | Sliding Door / HST |
| `3900` | MB59S - Automatically slide doors | `—` → — | Sliding Door |
| `3904` | COR VISION PLUS | `—` → — | Window / Door |
| `3908` | MB86 FOLD LINE (Bifold doors) | `—` → — | Window / Door |
| `3909` | MB86 FOLD LINE HD (Bifold doors) | `—` → — | Window / Door |
| `3910` | MB86 FOLD LINE HD (Bifold doors) - Corner | `—` → — | Corner Window / Door |
| `3950` | MB45- Automatically slide doors | `—` → — | Sliding Door |
| `3960` | MB79N  Automatically slide doors | `—` → — | Sliding Door |
| `3990` | MB-GLASS BARRIER | `—` → — | Window / Door |
| `6050` | Kolor lameli - panele ALU (R_) D101/O102/W645 | `—` → — | Window / Door |
| `6051` | Kolor lameli - panele ALU (R_) RAL/SPEC | `—` → — | Window / Door |
| `10803` | stick-on grills ALU | `—` → — | Window / Door |
| `11600` | Filtr - kolor aplikacji - panel | `—` → — | Window / Door |
| `11601` | Filtr - kolor ramki ozdobnej - panel | `—` → — | Window / Door |
| `11602` | Filtr - kolor profilu ozdobnego pochwytu - panel | `—` → — | Profile Component |
| `11603` | Filtr - kolor aplikacji - panel PIVOT 3 | `—` → — | Window / Door |
| `11604` | Filtr - kolor aplikacji (Ral 9005 mat)- panel PIVOT 7 | `—` → — | Window / Door |
| `11605` | Filtr - kolor systemowy (właściwość 1100 fitr) panel PIVOT 8 | `—` → — | Window / Door |
| `11606` | Filtr - kolor aplikacji panel PIVOT 8 - (VIP Amber) | `—` → — | Window / Door |
| `15018` | Kolory aplikacji panele ALU (R_) D101/O102/W645 | `—` → — | Window / Door |
| `15019` | Kolory aplikacji panele ALU (R_) RAL/SPEC | `—` → — | Window / Door |
| `6001` | ALU - Extensions PVC to ALU | `—` → — | Window / Door |
| `10029` | Kolory blokady rozwarcia ALU | `—` → — | Window / Door |
| `10041` | Colour farb RAL bez wskazania struktury | `—` → — | Window / Door |
| `10042` | Colour farb RAL ze wskazaniem struktury | `—` → — | Window / Door |
| `10104` | Colour osłonek FS ALU | `—` → — | Window / Door |
| `10105` | Colour nakładek ALU | `—` → — | Window / Door |
| `10107` | Colour Ventilationów RENSON ALU | `—` → — | Window / Door |
| `10603` | DZ- handle H6S26 OUTSIDE | `—` → — | Window / Door |
| `10613` | DZ - handle H6S26 Inside | `—` → — | Window / Door |
| `10617` | DZ - hingey doorowe ALU | `—` → — | Window / Door |
| `10618` | DZ - Door plate  Type 33 PZ BLACK anode | `—` → — | Entrance Door |
| `10720` | Glazing beads/profile dodatkowe ALU | `—` → — | Profile Component |
| `11022` | ALU - Colour zaslepek odwodnien | `—` → — | Window / Door |
| `11023` | ALU - Kolory zaslepek odwodnien - Cor Vision Plus | `—` → — | Window / Door |
| `11050` | ALU - HS pull handle color | `—` → — | Sliding Door / HST |
| `11121` | Colour osłonek - Palette turnidthzona | `—` → — | Window / Door |
| `11250` | Color of ventilation sleeves for ALU | `—` → — | Window / Door |
| `15025` | Wypełnienia DRUTEX ALU ADEK-ADEK/ADEK-ARAL | `—` → — | Window / Door |
| `15026` | Wypełnienia DRUTEX ALU BEZ(ADEK-ADEK/ADEK-ARAL) | `—` → — | Window / Door |

### PVC

| Code | Description | Profile System | Product Type |
|------|-------------|----------------|--------------|
| `1000` | ===== PVC ========================== | `—` → — | Window / Door |
| `1004` | IGLO HS | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1005` | IGLO SL | `DRUTEX2` → Baza: biala | Sliding Door |
| `1006` | IGLO SL - NAROZNIK | `DRUTEX2` → Baza: biala | Sliding Door |
| `1007` | IGLO EDGE SLIDE | `DRUTEX3` → Baza: biala, braz, antracyt | Sliding Door |
| `1008` | IGLO HS - NAROZNIK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1014` | IGLO HS ALUCOVER | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1100` | IGLO 5 - windows | `DRUTEX1` → Baza: biala, braz | Window |
| `1101` | IGLO 5 - PSK | `DRUTEX1` → Baza: biala, braz | Sliding Door / HST |
| `1102` | IGLO 5 - intermediate profile | `DRUTEX2` → Baza: biala | Profile Component |
| `1103` | IGLO 5 - Entrance doors | `—` → — | Entrance Door |
| `1104` | IGLO 5 - Entrance doors - Corner | `—` → — | Entrance Door |
| `1105` | IGLO 5 - intermediate profile PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1106` | IGLO 5 - DRZWI SERWISOWE | `DRUTEX2` → Baza: biala | Entrance Door |
| `1108` | IGLO 5 - Corner | `—` → — | Corner Window / Door |
| `1109` | IGLO 5 - sets | `—` → — | Window / Door |
| `1110` | IGLO 5 CLASSIC - WINDOWS | `—` → — | Window |
| `1111` | IGLO 5 CLASSIC - PSK | `—` → — | Sliding Door / HST |
| `1118` | IGLO 5 CLASSIC - Corner | `—` → — | Corner Window / Door |
| `1119` | IGLO 5 CLASSIC - sets | `—` → — | Window / Door |
| `1120` | IGLO 5 RENO - windows | `—` → — | Window |
| `1121` | IGLO 5 RENO - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1122` | IGLO 5 RENO - intermediate profile | `DRUTEX2` → Baza: biala | Profile Component |
| `1123` | IGLO 5 RENO - Entrance doors | `—` → — | Entrance Door |
| `1124` | IGLO 5 RENO - Entrance doors NAROZNIK | `DRUTEX1` → Baza: biala, braz | Entrance Door |
| `1126` | IGLO 5 RENO - DRZWI SERWISOWE | `DRUTEX2` → Baza: biala | Entrance Door |
| `1128` | IGLO 5 RENO - Corner | `DRUTEX1` → Baza: biala, braz | Corner Window / Door |
| `1129` | IGLO 5 RENO - sets ??? | `DRUTEX1` → Baza: biala, braz | Window / Door |
| `1130` | IGLO 5 CLASSIC RENO - windows | `—` → — | Window |
| `1131` | IGLO 5 CLASSIC RENO - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1132` | IGLO 5 CLASSIC RENO - intermediate profile | `DRUTEX2` → Baza: biala | Profile Component |
| `1138` | IGLO 5 CLASSIC RENO - Corner | `DRUTEX1` → Baza: biala, braz | Corner Window / Door |
| `1139` | IGLO 5 CLASSIC RENO - sets ??? | `DRUTEX1` → Baza: biala, braz | Window / Door |
| `1140` | IGLO 5 ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1141` | IGLO 5 ADAPT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1143` | IGLO 5 ADAPT - door | `DRUTEX2` → Baza: biala | Entrance Door |
| `1144` | IGLO 5 ADAPT - door Corner | `DRUTEX2` → Baza: biala | Entrance Door |
| `1145` | IGLO 5 ADAPT - intermediate profile PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1146` | IGLO 5 ADAPT - DRZWI SERWISOWE | `DRUTEX2` → Baza: biala | Entrance Door |
| `1148` | IGLO 5 ADAPT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1149` | IGLO 5 ADAPT - ZESTAWY | `—` → — | Window / Door |
| `1150` | IGLO 5 CLASSIC ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1151` | IGLO 5 CLASSIC ADAPT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1158` | IGLO 5 CLASSIC ADAPT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1159` | IGLO 5 CLASSIC ADAPT - ZESTAWY | `—` → — | Window / Door |
| `1200` | IGLO LIGHT - WINDOWS | `DRUTEX2` → Baza: biala | Window |
| `1201` | IGLO LIGHT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1208` | IGLO LIGHT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1209` | IGLO LIGHT - sets | `DRUTEX2` → Baza: biala | Window / Door |
| `1210` | IGLO LIGHT RENO - windows | `DRUTEX2` → Baza: biala | Window |
| `1211` | IGLO LIGHT RENO - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1218` | IGLO LIGHT RENO - NAROZNIK | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1219` | IGLO LIGHT RENO - sets??? | `DRUTEX2` → Baza: biala | Window / Door |
| `1250` | IGLO LIGHT ADAPT- windows | `DRUTEX2` → Baza: biala | Window |
| `1258` | IGLO LIGHT ADAPT- NAROZNIK | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1259` | IGLO LIGHT ADAPT - ZESTAWY | `—` → — | Window / Door |
| `1300` | IGLO ENERGY  - windows | `DRUTEX1` → Baza: biala, braz | Window |
| `1301` | IGLO ENERGY  - PSK | `DRUTEX1` → Baza: biala, braz | Sliding Door / HST |
| `1302` | IGLO ENERGY - PROFIL POŚREDNI | `DRUTEX3` → Baza: biala, braz, antracyt | Profile Component |
| `1303` | IGLO ENERGY  - Entrance doors | `—` → — | Entrance Door |
| `1304` | IGLO ENERGY  - Entrance doors Corner | `—` → — | Entrance Door |
| `1308` | IGLO ENERGY  - Corner | `DRUTEX1` → Baza: biala, braz | Corner Window / Door |
| `1309` | IGLO ENERGY - sets | `—` → — | Window / Door |
| `1310` | IGLO ENERGY CLASSIC - WINDOWS | `DRUTEX3` → Baza: biala, braz, antracyt | Window |
| `1311` | IGLO ENERGY CLASSIC - PSK | `DRUTEX3` → Baza: biala, braz, antracyt | Sliding Door / HST |
| `1318` | IGLO ENERGY CLASSIC - Corner | `DRUTEX3` → Baza: biala, braz, antracyt | Corner Window / Door |
| `1319` | IGLO ENERGY CLASSIC - SETS | `DRUTEX3` → Baza: biala, braz, antracyt | Window / Door |
| `1320` | IGLO ENERGY RENO - WINDOWS | `—` → — | Window |
| `1322` | IGLO ENERGY RENO - PROFIL POŚREDNI | `—` → — | Profile Component |
| `1323` | IGLO ENERGY RENO - Entrance doors | `—` → — | Entrance Door |
| `1324` | IGLO ENERGY RENO - Entrance doors Corner | `—` → — | Entrance Door |
| `1328` | IGLO ENERGY RENO - Corner | `—` → — | Corner Window / Door |
| `1329` | IGLO ENERGY RENO - sets ??? | `—` → — | Window / Door |
| `1330` | IGLO ENERGY CLASSIC RENO - windows | `—` → — | Window |
| `1338` | IGLO ENERGY CLASSIC RENO - Corner | `—` → — | Corner Window / Door |
| `1339` | IGLO ENERGY CLASSIC RENO - sets ??? | `—` → — | Window / Door |
| `1340` | IGLO ENERGY ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1341` | IGLO ENERGY ADAPT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1342` | IGLO ENERGY ADAPT - PROFIL POŚREDNI | `DRUTEX2` → Baza: biala | Profile Component |
| `1343` | IGLO ENERGY ADAPT - door | `DRUTEX2` → Baza: biala | Entrance Door |
| `1344` | IGLO ENERGY ADAPT - door Corner | `DRUTEX2` → Baza: biala | Entrance Door |
| `1348` | IGLO ENERGY ADAPT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1349` | IGLO ENERGY ADAPT - ZESTAWY | `—` → — | Window / Door |
| `1350` | IGLO ENERGY CLASSIC ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1351` | IGLO ENERGY CLASSIC ADAPT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1358` | IGLO ENERGY CLASSIC ADAPT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1359` | IGLO ENERGY CLASSIC ADAPT -  ZESTAWY | `—` → — | Window / Door |
| `1360` | IGLO ENERGY ALUCOVER - windows | `—` → — | Window |
| `1361` | IGLO ENERGY ALUCOVER - PSK | `—` → — | Sliding Door / HST |
| `1368` | IGLO ENERGY ALUCOVER - Corner | `—` → — | Corner Window / Door |
| `1369` | IGLO ENERGY ALUCOVER - sets | `—` → — | Window / Door |
| `1370` | IGLO ENERGY ALUCOVER RENO - windows | `DRUTEX2` → Baza: biala | Window |
| `1371` | IGLO ENERGY ALUCOVER RENO - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1378` | IGLO ENERGY ALUCOVER RENO - NAROZNIK | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1379` | IGLO ENERGY ALUCOVER RENO - sets | `DRUTEX2` → Baza: biala | Window / Door |
| `1380` | IGLO ENERGY ALUCOVER ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1381` | IGLO ENERGY ALUCOVER ADAPT - PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1388` | IGLO ENERGY ALUCOVER ADAPT - Corner | `DRUTEX2` → Baza: biala | Corner Window / Door |
| `1389` | IGLO ENERGY ALUCOVER ADAPT - ZESTAWY | `—` → — | Window / Door |
| `1400` | IGLO EXT - windows | `DRUTEX2` → Baza: biala | Window |
| `1409` | IGLO EXT - sets | `DRUTEX2` → Baza: biala | Window / Door |
| `1420` | IGLO EXT RENO - windows | `DRUTEX2` → Baza: biala | Window |
| `1440` | IGLO EXT ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1500` | IGLO PREMIER - windows | `DRUTEX2` → Baza: biala | Window |
| `1509` | IGLO PREMIER - sets | `DRUTEX2` → Baza: biala | Window / Door |
| `1520` | IGLO PREMIER RENO - windows | `DRUTEX2` → Baza: biala | Window |
| `1540` | IGLO PREMIER ADAPT - windows | `DRUTEX2` → Baza: biala | Window |
| `1600` | IGLO EDGE - WINDOWS | `DRUTEX3` → Baza: biala, braz, antracyt | Window |
| `1601` | IGLO EDGE  - PSK | `DRUTEX3` → Baza: biala, braz, antracyt | Sliding Door / HST |
| `1602` | IGLO EDGE  - PROFIL POŚREDNI | `DRUTEX3` → Baza: biala, braz, antracyt | Profile Component |
| `1603` | IGLO EDGE - ENTRANCE DOORS | `DRUTEX3` → Baza: biala, braz, antracyt | Entrance Door |
| `1608` | IGLO EDGE - CORNER | `DRUTEX3` → Baza: biala, braz, antracyt | Corner Window / Door |
| `1609` | IGLO EDGE - SETS | `DRUTEX3` → Baza: biala, braz, antracyt | Window / Door |
| `1620` | IGLO EDGE RENO | `DRUTEX3` → Baza: biala, braz, antracyt | Window / Door |
| `1623` | IGLO EDGE RENO - DRZWI WEJŚCIOWE | `DRUTEX3` → Baza: biala, braz, antracyt | Entrance Door |
| `1629` | IGLO EDGE RENO - ZESTAWY | `DRUTEX3` → Baza: biala, braz, antracyt | Window / Door |
| `1700` | NEO 76 AD | `—` → — | Window / Door |
| `1701` | NEO 76 AD - PSK | `—` → — | Sliding Door / HST |
| `1702` | NEO 76 AD - PROFIL POŚREDNI | `DRUTEX2` → Baza: biala | Profile Component |
| `1703` | NEO 76 AD - DRZWI WEJŚCIOWE | `—` → — | Entrance Door |
| `1704` | NEO 76 AD - DRZWI WEJŚCIOWE - NAROŻNIK | `—` → — | Entrance Door |
| `1705` | NEO 76 AD - PROFIL POŚREDNI PSK | `DRUTEX2` → Baza: biala | Sliding Door / HST |
| `1708` | NEO 76 AD - NAROŻNIK | `—` → — | Window / Door |
| `1709` | NEO 76 AD - ZESTAWY | `—` → — | Window / Door |
| `1710` | NEO 76 MD | `—` → — | Window / Door |
| `1711` | NEO 76 MD - PSK | `—` → — | Sliding Door / HST |
| `1712` | NEO 76 MD - PROFIL POŚREDNI | `—` → — | Profile Component |
| `1713` | NEO 76 MD - FRONT DOOR | `—` → — | Entrance Door |
| `1714` | NEO 76 MD - DRZWI WEJŚCIOWE - NAROŻNIK | `—` → — | Entrance Door |
| `1715` | NEO 76 MD - PROFIL POŚREDNI PSK | `—` → — | Sliding Door / HST |
| `1718` | NEO 76 MD - NAROŻNIK | `—` → — | Window / Door |
| `1719` | NEO 76 MD - ZESTAWY | `—` → — | Window / Door |
| `1720` | NEO 76 MD RENO | `—` → — | Window / Door |
| `1721` | NEO 76 MD RENO - PSK | `—` → — | Sliding Door / HST |
| `1722` | NEO 76 MD RENO - PROFIL POŚREDNI | `—` → — | Profile Component |
| `1723` | NEO 76 MD RENO - DRZWI WEJŚCIOWE | `—` → — | Entrance Door |
| `1724` | NEO 76 MD RENO - DRZWI WEJŚCIOWE - NAROŻNIK | `—` → — | Entrance Door |
| `1725` | NEO 76 MD RENO - PROFIL POŚREDNI PSK | `—` → — | Sliding Door / HST |
| `1728` | NEO 76 MD RENO - NAROŻNIK | `—` → — | Window / Door |
| `1729` | NEO 76 MD RENO - ZESTAWY | `—` → — | Window / Door |
| `1730` | NEO 76 MD MONO | `—` → — | Window / Door |
| `1731` | NEO 76 MD MONO - PSK | `—` → — | Sliding Door / HST |
| `1732` | NEO 76 MD MONO - PROFIL POŚREDNI | `—` → — | Profile Component |
| `1733` | NEO 76 MD MONO - DRZWI WEJŚCIOWE | `—` → — | Entrance Door |
| `1734` | NEO 76 MD MONO - DRZWI WEJŚCIOWE - NAROŻNIK | `—` → — | Entrance Door |
| `1735` | NEO 76 MD MONO - PROFIL POŚREDNI PSK | `—` → — | Sliding Door / HST |
| `1738` | NEO 76 MD MONO - NAROŻNIK | `—` → — | Window / Door |
| `1739` | NEO 76 MD MONO - ZESTAWY | `—` → — | Window / Door |
| `1750` | IDEAL 7000 NL | `—` → — | Window / Door |
| `1751` | IDEAL 7000 NL - PSK | `—` → — | Sliding Door / HST |
| `1752` | IDEAL 7000 NL - PROFIL POŚREDNI | `—` → — | Profile Component |
| `1753` | IDEAL 7000 NL - DRZWI WEJŚCIOWE | `—` → — | Entrance Door |
| `1754` | IDEAL 7000 NL - DRZWI WEJŚCIOWE - NAROŻNIK | `—` → — | Entrance Door |
| `1755` | IDEAL 7000 NL - PROFIL POŚREDNI PSK | `—` → — | Sliding Door / HST |
| `1756` | IDEAL 7000 NL - OKNA OTW NA ZEWN | `—` → — | Window / Door |
| `1758` | IDEAL 7000 NL - NAROŻNIK | `—` → — | Window / Door |
| `1759` | IDEAL 7000 NL - ZESTAWY | `—` → — | Window / Door |
| `4001` | Outdoor shutters | `—` → — | Roller Shutter |
| `4002` | Kolor listwy dolnej moskitiery RN_175 ELITE | `—` → — | Mosquito Screen |
| `4009` | Kolor skrzynek RA45_205 | `—` → — | Window / Door |
| `4010` | Kolory siatki moskitiery | `—` → — | Mosquito Screen |
| `4011` | Curtain color 37 | `—` → — | Window / Door |
| `4012` | Curtain color 42 | `—` → — | Window / Door |
| `4013` | Curtain color 55 | `—` → — | Window / Door |
| `4014` | Colour guides aluminiowych to roller shutters RS standard | `—` → — | Roller Shutter |
| `4015` | Colour guides aluminiowych to roller shutters RS non-standar | `—` → — | Roller Shutter |
| `4016` | Colour guides aluminiowych to roller shutters RA | `—` → — | Roller Shutter |
| `4017` | Colour guides PVC to roller shutters | `—` → — | Roller Shutter |
| `4018` | Colour listew końcowych armoura standard | `—` → — | Window / Door |
| `4019` | Colour listew końcowych armoura non-standard | `—` → — | Window / Door |
| `4020` | Colour zakończeń guides to roller shutters | `—` → — | Roller Shutter |
| `4021` | Colour skrzynek RA45 | `—` → — | Window / Door |
| `4022` | Colour skrzynek RAOW | `—` → — | Window / Door |
| `4023` | Colour skrzynek RA90 | `—` → — | Window / Door |
| `4024` | Colour skrzynek RN | `—` → — | Window / Door |
| `4025` | Colour skrzynek RSW/RSZ | `—` → — | Window / Door |
| `4026` | Colour ANGLEów to roller shutters out (bez RSZ) | `—` → — | Roller Shutter |
| `4027` | Colour ANGLEów to roller shutters ins | `—` → — | Roller Shutter |
| `4028` | Colour ANGLEów ALU to roller shutters RSZ | `—` → — | Roller Shutter |
| `4029` | Colour Bufferów 20mm | `—` → — | Window / Door |
| `4030` | Colour Bufferów 40mm | `—` → — | Window / Door |
| `4031` | Colour adapterów RSW 956 / 957 | `—` → — | Window / Door |
| `4032` | Colour adapterów RSW 969 | `—` → — | Window / Door |
| `4033` | Kolor zamka baskwilowego | `—` → — | Window / Door |
| `4034` | Colour guides drewnianych to roller shutters | `—` → — | Roller Shutter |
| `4035` | Colour bottom slat Mosquito nets RS standard | `—` → — | Window / Door |
| `4036` | Colour bottom slat Mosquito nets RS non-standard | `—` → — | Window / Door |
| `4037` | Colour bottom slat Mosquito nets RA/RN standard | `—` → — | Window / Door |
| `4038` | Colour bottom slat Mosquito nets RA/RN non-standard | `—` → — | Window / Door |
| `4039` | Colour bottom slat Mosquito nets RN_175 SKS | `—` → — | Window / Door |
| `4040` | Colour elementów rolet aluminiowych non-standard | `—` → — | Window / Door |
| `4041` | Colour profilu rewizyjnego RS PVC | `—` → — | Profile Component |
| `4042` | Colour profilu rewizyjnego RS ALU | `—` → — | Profile Component |
| `4043` | Colour guides aluminiowych to roller shutters RN | `—` → — | Roller Shutter |
| `4044` | Kolor lameli do paneli D-Art(panele nakładkowe ELEGANCE MB86 | `—` → — | Window / Door |
| `4045` | Kolor paneli D-Art (panele nakładkowe MB86N) | `—` → — | Window / Door |
| `4046` | Kolory pochwytu okrągłego D-Art (panele nakładkowe MB86N) | `—` → — | Window / Door |
| `4047` | Kolory listwy dolnej D-Art (panele nakładkowe MB86N) | `—` → — | Window / Door |
| `4048` | Kolor buforów 28mm | `—` → — | Window / Door |
| `4049` | Kolor zaślepek obudowy bocznej (RN215/225) | `—` → — | Window / Door |
| `4050` | Kolor zaślepek obudowy bocznej (RN175 SKS) | `—` → — | Window / Door |
| `4051` | Roller shutter RN bulk (filter) | `—` → — | Roller Shutter |
| `4052` | Roller shutter RA bulk (filter) | `—` → — | Roller Shutter |
| `4053` | Roller shutter RSW bulk (filter) | `—` → — | Roller Shutter |
| `4054` | Roller shutter RSZ bulk (filter) | `—` → — | Roller Shutter |
| `4055` | Roleta RNV luzem (filtr) | `—` → — | Roller Shutter |
| `4056` | Roleta RDZ luzem (filtr) | `—` → — | Roller Shutter |
| `4057` | Kolor panelu PIVOT 8 - VIP Rustico | `—` → — | Window / Door |
| `4058` | Kolor panelu PIVOT 7 - Industrial Bronze | `—` → — | Window / Door |
| `4059` | Kolor paneli C - Classic (VP Trend) | `—` → — | Window / Door |
| `4060` | Kolor paneli L - Lamelowe (VP Trend) | `—` → — | Window / Door |
| `4061` | Roller shutter RN for window PVC (filter) | `—` → — | Roller Shutter |
| `4062` | Roller shutter RA for window PVC (filter) | `—` → — | Roller Shutter |
| `4063` | Roller shutter RSW for window PVC (filter) | `—` → — | Roller Shutter |
| `4064` | Roller shutter RSZ for window PVC (filter) | `—` → — | Roller Shutter |
| `4065` | Roleta RNV do okna PVC (filtr) | `—` → — | Roller Shutter |
| `4071` | Roller shutter RN for window ALU (filter) | `—` → — | Roller Shutter |
| `4072` | Roller shutter RA for window ALU (filter) | `—` → — | Roller Shutter |
| `4073` | Roller shutter RSW for window ALU (filter) | `—` → — | Roller Shutter |
| `4074` | Roller shutter RSZ for window ALU (filter) | `—` → — | Roller Shutter |
| `4075` | Roleta RNV do okna ALU (filtr) | `—` → — | Roller Shutter |
| `4081` | Roller shutter RN for window DRE (filter) | `—` → — | Roller Shutter |
| `4082` | Roller shutter RA for window DRE (filter) | `—` → — | Roller Shutter |
| `4083` | Roller shutter RSW for window DRE (filter) | `—` → — | Roller Shutter |
| `4084` | Roller shutter RSZ for window DRE (filter) | `—` → — | Roller Shutter |
| `4085` | Roleta RNV do okna DRE (filtr) | `—` → — | Roller Shutter |
| `4091` | Roller shutter RN for window DRA (filter) | `—` → — | Roller Shutter |
| `4092` | Roller shutter RA for window DRA (filter) | `—` → — | Roller Shutter |
| `4093` | Roller shutter RSW for window DRA (filter) | `—` → — | Roller Shutter |
| `4094` | Roller shutter RSZ for window DRA (filter) | `—` → — | Roller Shutter |
| `4095` | Roleta RNV do okna DRA (filtr) | `—` → — | Roller Shutter |
| `4098` | Color of the flush-mounted strip (styrofoam clinker) | `—` → — | Window / Door |
| `4099` | Kolor boków rolet RA90 (malowane) | `—` → — | Window / Door |
| `4100` | ===== Facade blinds ========================== | `—` → — | Window / Door |
| `4101` | Facade blinds | `—` → — | Window / Door |
| `4109` | Żaluzje fasadowe - prowadnice _R | `—` → — | Window / Door |
| `4110` | Żaluzje fasadowe - prowadnice | `—` → — | Window / Door |
| `4111` | Slat color C80 | `—` → — | Window / Door |
| `4115` | Colour guides aluminiowych do venetian blinds ZFA | `—` → — | Window / Door |
| `4116` | Colour guides aluminiowych do venetian blinds ZFS | `—` → — | Window / Door |
| `4117` | Colour guides PVC do venetian blinds ZFS | `—` → — | Window / Door |
| `4120` | Colour zakończeń guides do venetian blinds | `—` → — | Window / Door |
| `4121` | Colour skrzynek ZFA | `—` → — | Window / Door |
| `4122` | Colour skrzynek ZFS | `—` → — | Window / Door |
| `4130` | Colour elementów zabulkji aluminiowych non-standard | `—` → — | Window / Door |
| `4200` | ===== Cassonetto ========================== | `—` → — | Window / Door |
| `4201` | Cassonetto | `—` → — | Window / Door |
| `4250` | ===== Żaluzje Venus ========================== | `—` → — | Window / Door |
| `4251` | Żaluzje Venus | `—` → — | Window / Door |
| `4255` | Żaluzje Venus - kolor rynny górnej i obciąznika | `—` → — | Window / Door |
| `4400` | ===== Insect screen ========================== | `—` → — | Mosquito Screen |
| `4401` | Pleated insect screen | `—` → — | Mosquito Screen |
| `4402` | Mosquito nets | `—` → — | Window / Door |
| `4403` | Moskitiera drzwiowa | `—` → — | Mosquito Screen |
| `4404` | Moskitiera otwierana - kolory niestandardowe | `—` → — | Mosquito Screen |
| `4405` | Pleated insect screen Top Zag | `—` → — | Mosquito Screen |
| `4406` | Pleated insect screen Click-Roll | `—` → — | Mosquito Screen |
| `4407` | Mosquito Flex-Screen | `—` → — | Window / Door |
| `5001` | iQuote - accessories PVC | `—` → — | Window / Door |
| `10028` | Colour klamek EXT | `—` → — | Window / Door |
| `10320` | Gluing the glazing unit in the sash | `—` → — | Window / Door |
| `10321` | Gluing the glazing unit in the fix | `—` → — | Window / Door |
| `10322` | Gluing the glazing unit in the RC2 fix | `—` → — | Window / Door |
| `10323` | Gluing the package in the passive sash on the handle side | `—` → — | Window / Door |
| `10350` | Kolory - wrzutka na listy do wypełnień GAVA88001 | `—` → — | Window / Door |
| `10351` | Kolory - wrzutka na listy do wypełnień SW-02 | `—` → — | Window / Door |
| `10400` | Kolor drzwi dla pupila (filtr) - biale | `—` → — | Entrance Door |
| `10401` | Kolor drzwi dla pupila (filtr) - biale,braz | `—` → — | Entrance Door |
| `10402` | Kolor drzwi dla pupila (filtr) - biale,braz,antracyt | `—` → — | Entrance Door |
| `10801` | stick-on grills | `—` → — | Window / Door |
| `15031` | Piaskowania Type 1 (do szyb squareowych) | `—` → — | Window / Door |
| `15032` | Piaskowania Type 2 (do szyb prostoAnglenych) | `—` → — | Window / Door |
| `15035` | Piaskowania typ dx_32 | `—` → — | Window / Door |
| `15036` | Piaskowania typ dx_33 | `—` → — | Window / Door |
| `15037` | Piaskowania typ dx_34 | `—` → — | Window / Door |
| `15038` | Piaskowania typ dx_35 | `—` → — | Window / Door |
| `9999` | Glass | `—` → — | Window / Door |
| `10011` | PVC - handle malowane | `—` → — | Window / Door |
| `10012` | PVC - Hoppe handle | `—` → — | Window / Door |
| `10013` | PVC - Hoppe handle TOULON, HAMBURG | `—` → — | Window / Door |
| `10015` | PVC - handle PZ malowane | `—` → — | Window / Door |
| `10017` | PVC - handle PSK sterowanie ręczne | `—` → — | Sliding Door / HST |
| `10018` | PVC - handle PSK sterowanie automatyczne | `—` → — | Sliding Door / HST |
| `10019` | PVC - HS handleT | `—` → — | Sliding Door / HST |
| `10020` | Filter - handle FS sash czynne | `—` → — | Window / Door |
| `10021` | Filter - handle FS passive sash | `—` → — | Window / Door |
| `10022` | PVC - Colour zaslepek odwodnien | `—` → — | Window / Door |
| `10023` | PVC - Colour profilu bazowego | `—` → — | Profile Component |
| `10024` | PVC - Color of the knob for the rigid chain | `—` → — | Window / Door |
| `10025` | Colour Mountów do Latchów Balcony doorowych | `—` → — | Balcony Door |
| `10026` | Colour blokady turnarcia | `—` → — | Window / Door |
| `10027` | Colour Multi Vent | `—` → — | Window / Door |
| `10030` | PVC - Artykuły w Colourach podst.: white / brown | `—` → — | Window / Door |
| `10033` | PVC - Artykuły w kolorach podst.: czarny | `—` → — | Window / Door |
| `10031` | PVC - Artykuły w Colourach podst.: white / veneer | `—` → — | Window / Door |
| `10032` | Kolory uchwytów do zatrzasków balkonowych DeLuxe | `—` → — | Balcony Door |
| `10034` | PVC - Kolory zaslepek odwodnien monoblock | `—` → — | Window / Door |
| `10050` | Colour progów HST HH.. | `—` → — | Sliding Door / HST |
| `10051` | Colour progów for windows | `—` → — | Window |
| `10052` | Colour progów HST EcoPass | `—` → — | Sliding Door / HST |
| `10060` | Colour bumperów HST | `—` → — | Sliding Door / HST |
| `10061` | Colour akcesoriów HST | `—` → — | Sliding Door / HST |
| `10062` | Colour profili bez uszczelek HST | `—` → — | Sliding Door / HST |
| `10070` | Colour zaślepek movable post V70,V82,A70 | `—` → — | Window / Door |
| `10071` | Colour zaślepek movable post V90 | `—` → — | Window / Door |
| `10080` | Colour otwieraczy naświetli | `—` → — | Window / Door |
| `10081` | Colour otwieraczy naświetli (FLEXIBLE CABLE) | `—` → — | Window / Door |
| `10082` | Kolory otwieraczy naświetli FL190 (CIĘGNO GIĘTKIE) | `—` → — | Window / Door |
| `10083` | Kolory otwieraczy naświetli FL190 (KORBA) | `—` → — | Window / Door |
| `10084` | Kolory otwieraczy naświetli FL190 | `—` → — | Window / Door |
| `10085` | Colour Sillów insnetrznych | `—` → — | Window / Door |
| `10100` | Colour Grillów 8mm | `—` → — | Window / Door |
| `10101` | Colour Grillów 18mm | `—` → — | Window / Door |
| `10102` | Colour Grillów 26mm | `—` → — | Window / Door |
| `10103` | Colour Grillów 45mm | `—` → — | Window / Door |
| `10106` | Colour Ventilationów RENSON PVC | `—` → — | Window / Door |
| `10108` | Ventilations downdrafts RADAKS/REGEL | `—` → — | Window / Door |
| `10109` | AMO ventilation colour -standard | `—` → — | Window / Door |
| `10110` | AERECO ventilation colour -standard | `—` → — | Window / Door |
| `10111` | Colour Ventilationów VENTEC standard | `—` → — | Window / Door |
| `10112` | Colour okapów under the roller shutter for ventilation AMO | `—` → — | Roller Shutter |
| `10113` | Colour Ventilationów VENTAIR standard | `—` → — | Window / Door |
| `10114` | BROOKVENT 1 ventilation colour -standard | `—` → — | Window / Door |
| `10115` | BROOKVENT 2 ventilation colour -non-standard | `—` → — | Window / Door |
| `10116` | BROOKVENT 4 ventilation colour -standard | `—` → — | Window / Door |
| `10117` | Colour Ventilationów BROOKVENT 4 standard | `—` → — | Window / Door |
| `10118` | Colour Ventilationów ZUROH | `—` → — | Window / Door |
| `10120` | Colour osłonek - Palette podstawowa | `—` → — | Window / Door |
| `10121` | Colour osłonek - Palette turnidthzona | `—` → — | Window / Door |
| `10122` | Colour osłonek - hingey budowlane | `—` → — | Window / Door |
| `10123` | Colour pochwycików | `—` → — | Window / Door |
| `10124` | Colour osłonek - PSK (PVC) | `—` → — | Sliding Door / HST |
| `10125` | Colour hingeów EXT | `—` → — | Window / Door |
| `10126` | Colour osłonek - PSK (ALU) | `—` → — | Sliding Door / HST |
| `10127` | Kolory osłonek ROTO | `—` → — | Window / Door |
| `10128` | Kolory osłonek kształt KOŁO - zawiasy HAUTAU | `—` → — | Window / Door |
| `10129` | AMO ventilation colour -non-standard | `—` → — | Window / Door |
| `10130` | AERECO ventilation colour -non-standard | `—` → — | Window / Door |
| `10131` | Colour Ventilationów VENTEC non-standard | `—` → — | Window / Door |
| `10133` | Colour Ventilationów VENTAIR non-standard | `—` → — | Window / Door |
| `10134` | BROOKVENT 1 ventilation colour -non-standard | `—` → — | Window / Door |
| `10135` | BROOKVENT 2 ventilation colour -standard | `—` → — | Window / Door |
| `10136` | BROOKVENT 3 ventilation colour -non-standard | `—` → — | Window / Door |
| `10137` | BROOKVENT 4 ventilation colour -non-standard | `—` → — | Window / Door |
| `10138` | Kolory nawiewników SLIMLINE 2000 | `—` → — | Window / Door |
| `10211` | Packagey do wypełnień 36mm PVC | `—` → — | Window / Door |
| `10212` | Packagey do wypełnień 36mm ALU | `—` → — | Window / Door |
| `10213` | Packagey do wypełnień 77mm ALU | `—` → — | Window / Door |
| `10214` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `—` → — | Window / Door |
| `10215` | Pakiety do wypełnień 24mm PVC | `—` → — | Window / Door |
| `10216` | Pakiety do wypełnień 48mm PVC | `—` → — | Window / Door |
| `10217` | Pakiety do wypełnień 23mm ALU | `—` → — | Window / Door |
| `10218` | Pakiety do wypełnień 35mm ALU | `—` → — | Window / Door |
| `10219` | Pakiety do wypełnień 47mm ALU | `—` → — | Window / Door |
| `10220` | Pakiety do wypełnień 77mm ALU do panelu CLASSIC3 | `—` → — | Window / Door |
| `10221` | Colour pull handle ów M2 for PVC | `—` → — | Window / Door |
| `10222` | Colour pull handle ów M2 to ALU | `—` → — | Window / Door |
| `10226` | Pakiety do wypełnień 77mm ALU do panelu MODERN_15_C | `—` → — | Window / Door |
| `10208` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Lacobel | `—` → — | Window / Door |
| `10209` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `—` → — | Window / Door |
| `10210` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Milk2Line | `—` → — | Window / Door |
| `10225` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą LacobelLin | `—` → — | Window / Door |
| `10223` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `—` → — | Window / Door |
| `10224` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `—` → — | Window / Door |
| `10250` | Pakiety do wypełnień 24mm DRUTEX_C | `—` → — | Window / Door |
| `10251` | Pakiety do wypełnień 36mm DRUTEX_C | `—` → — | Window / Door |
| `10252` | Pakiety do wypełnień 48mm DRUTEX_C | `—` → — | Window / Door |
| `10260` | Pakiety do wypełnień 28mm DRUTEX_DRE | `—` → — | Window / Door |
| `10261` | Pakiety do wypełnień 40mm DRUTEX_DRE | `—` → — | Window / Door |
| `10262` | Pakiety do wypełnień 48mm DRUTEX_DRE | `—` → — | Window / Door |
| `10290` | Ramki międzyszybowe do paneli drutex | `—` → — | Window / Door |
| `10291` | Ramki międzyszybowe do paneli VPTrend | `—` → — | Window / Door |
| `10300` | Color Self-closer Geze TS2000 | `—` → — | Window / Door |
| `10301` | Color Self-closer Geze TS4000 | `—` → — | Window / Door |
| `10302` | Color Self-closer DORMA TS PROFIL | `—` → — | Profile Component |
| `10303` | DORMA TS 93 self-closer colour | `—` → — | Window / Door |
| `10304` | Color Self-closer Geze TS5000 | `—` → — | Window / Door |
| `10600` | DZ- handle OUTSIDE | `—` → — | Window / Door |
| `10650` | Kolory ramki przyszybowej paneli | `—` → — | Window / Door |
| `10601` | TZ- handle tarasowe OUTSIDE | `—` → — | Balcony Door |
| `10602` | DZ - Rozety OUTSIDE | `—` → — | Window / Door |
| `10632` | DZ - Rozety zewnątrz ALU | `—` → — | Window / Door |
| `10605` | DZ- pull handle y | `—` → — | Window / Door |
| `10610` | DZ - handle Inside | `—` → — | Window / Door |
| `10612` | DZ - Rozety Inside | `—` → — | Window / Door |
| `10642` | DZ - Rozety wewnątrz ALU | `—` → — | Window / Door |
| `10615` | DZ - hingey doorowe | `—` → — | Window / Door |
| `10619` | DZ - Zawiasy drzwiowe JOCKER / Rolkowe | `—` → — | Entrance Door |
| `10620` | DZ - Rozety SATURN | `—` → — | Window / Door |
| `10621` | DZ - Zawiasy drzwiowe DR.HAHN | `—` → — | Entrance Door |
| `10622` | DZ - Zawiasy drzwiowe DR.HAHN (ale nie w NL7000) | `—` → — | Entrance Door |
| `10702` | Glazing beads PVC | `—` → — | Window / Door |
| `10703` | Listwy przyszybowe PVC - Aluplast | `—` → — | Window / Door |
| `10802` | stick-on grills VEKA | `—` → — | Window / Door |
| `10902` | Silly VEKA | `—` → — | Window / Door |
| `10905` | Silly aluminiowe | `—` → — | Window / Door |
| `15001` | Wzory piaskowań | `—` → — | Window / Door |
| `15010` | Wypełnienia Drutex PVC | `—` → — | Window / Door |
| `15016` | Wypełnienia DRUTEX DRE (3D_WOOD_1) | `—` → — | Window / Door |
| `15020` | PŁyty sandwich PVC | `—` → — | Window / Door |
| `15021` | PŁyty sandwich ALU | `—` → — | Window / Door |
| `15022` | PŁyty sandwich PVC | `—` → — | Window / Door |
| `15024` | Wypełnienia DRUTEX DRE (bez 3D_WOOD_1) | `—` → — | Window / Door |
| `15100` | Wypełnienia DRUTEX PVC - grubość wypełnienia 36,48 | `—` → — | Window / Door |
| `15011` | Wypełnienia Drutex ALU | `—` → — | Window / Door |
| `15012` | Wypełnienia Drutex ALU only Cap | `—` → — | Window / Door |
| `15013` | KN infills | `—` → — | Window / Door |
| `15014` | Wypełnienia DRUTEX L (LAMELE) | `—` → — | Window / Door |
| `16000` | Colour akcesorii do ecosol70 | `—` → — | Window / Door |
| `19615` | DZ - hingey doorowe | `—` → — | Window / Door |

### Wood / System

| Code | Description | Profile System | Product Type |
|------|-------------|----------------|--------------|
| `2000` | ===== WOOD ========================== | `—` → — | Window / Door |
| `2100` | SOFTLINE68 windows, balcony doors | `—` → — | Balcony Door |
| `2101` | SOFTLINE68 PSK | `—` → — | Sliding Door / HST |
| `2103` | SOFTLINE68 Entrance doors | `—` → — | Entrance Door |
| `2104` | SOFTLINE68 HS | `—` → — | Sliding Door / HST |
| `2108` | SOFTLINE68 Bifold doors | `—` → — | Window / Door |
| `2109` | SOFTLINE68 sets | `—` → — | Window / Door |
| `2200` | SOFTLINE78 windows, balcony doors | `—` → — | Balcony Door |
| `2201` | SOFTLINE78 PSK | `—` → — | Sliding Door / HST |
| `2203` | SOFTLINE78 Entrance doors | `—` → — | Entrance Door |
| `2204` | SOFTLINE78 HS | `—` → — | Sliding Door / HST |
| `2209` | SOFTLINE78 sets | `—` → — | Window / Door |
| `2300` | SOFTLINE88 windows, balcony doors | `—` → — | Balcony Door |
| `2301` | SOFTLINE88 PSK | `—` → — | Sliding Door / HST |
| `2303` | SOFTLINE88 FRONT DOOR | `—` → — | Entrance Door |
| `2304` | SOFTLINE88 HS | `—` → — | Sliding Door / HST |
| `2309` | SOFTLINE88 sets | `—` → — | Window / Door |
| `2500` | ===== DUOLINE ========================== | `—` → — | Window / Door |
| `2600` | DUOLINE68 windows, balcony doors | `—` → — | Balcony Door |
| `2601` | DUOLINE68 PSK | `—` → — | Sliding Door / HST |
| `2604` | DUOLINE68 HS | `—` → — | Sliding Door / HST |
| `2609` | DUOLINE68 sets | `—` → — | Window / Door |
| `2700` | DUOLINE78 windows, balcony doors | `—` → — | Balcony Door |
| `2701` | DUOLINE 78 PSK | `—` → — | Sliding Door / HST |
| `2704` | DUOLINE78 HS | `—` → — | Sliding Door / HST |
| `2709` | DUOLINE78 sets | `—` → — | Window / Door |
| `2800` | DUOLINE88 windows, balcony doors | `—` → — | Balcony Door |
| `2804` | DUOLINE88 HS | `—` → — | Sliding Door / HST |
| `2809` | DUOLINE88 sets | `—` → — | Window / Door |
| `4000` | ===== Roller shutter ========================== | `—` → — | Roller Shutter |
| `5000` | ===== iQuote ========================== | `—` → — | Window / Door |
| `5002` | iQuote - accessories DRE | `—` → — | Window / Door |
| `5003` | iQuote - accessories DRA | `—` → — | Window / Door |
| `8000` | ======== Bramy ================================= | `—` → — | Window / Door |
| `8011` | Garage doors | `—` → — | Garage Door |
| `8012` | Bramy przemysłowe | `—` → — | Window / Door |
| `8101` | Kolory paneli grubość 60 - standardowe | `—` → — | Window / Door |
| `8102` | Kolory paneli grubość 60 - niestandardowe | `—` → — | Window / Door |
| `8112` | Kolory paneli gr 40 Wysokie Woodgrain - standardowe | `—` → — | Window / Door |
| `8113` | Kolory paneli gr 40 Niskie Woodgrain - standardowe | `—` → — | Window / Door |
| `8114` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain - standardowe | `—` → — | Window / Door |
| `8115` | Kolory paneli gr 40 Wysokie Woodgrain - niestandardowe | `—` → — | Window / Door |
| `8116` | Kolory paneli gr 40 Niskie Woodgrain - niestandardowe | `—` → — | Window / Door |
| `8117` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain-niestandardowe | `—` → — | Window / Door |
| `8122` | Kolory paneli gr 40 Wysokie Gladkie - standardowe | `—` → — | Window / Door |
| `8123` | Kolory paneli gr 40 Niskie Gładkie - standardowe | `—` → — | Window / Door |
| `8124` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - standardowe | `—` → — | Window / Door |
| `8125` | Kolory paneli gr 40 Wysokie Gladkie - niestandardowe | `—` → — | Window / Door |
| `8126` | Kolory paneli gr 40 Niskie Gładkie - niestandardowe | `—` → — | Window / Door |
| `8127` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - niestandardowe | `—` → — | Window / Door |
| `8130` | Kolory paneli struktura wew | `—` → — | Window / Door |
| `8131` | Kolory prowadnic/ościeżnic - Bramy standard | `—` → — | Window / Door |
| `8132` | Kolory okien - Bramy | `—` → — | Window / Door |
| `8133` | Kolory okien stal nierdzewna- Bramy | `—` → — | Window / Door |
| `8135` | Kolory kratek wentylacyjnych - Bramy | `—` → — | Window / Door |
| `8136` | Kolory okien czarny- Bramy | `—` → — | Window / Door |
| `8137` | Kolory okien biały- Bramy | `—` → — | Window / Door |
| `8138` | Kolory okien aluminium- Bramy | `—` → — | Window / Door |
| `8139` | Kolory prowadnic/ościeżnic - Bramy renowacja | `—` → — | Window / Door |
| `8140` | Kolory podwieszeń bramy | `—` → — | Window / Door |
| `8145` | Kolory zawiasów/okuć | `—` → — | Window / Door |
| `8150` | Type of glazing window M1 - gate | `—` → — | Window |
| `8151` | Type of glazing window P6,K2,O2,P4,P3,P2 - gate | `—` → — | Window |
| `8200` | Przetłoczenia gr. 40 | `—` → — | Window / Door |
| `8201` | Przetłoczenia gr. 60 | `—` → — | Window / Door |
| `8205` | Grubość paneli 40mm | `—` → — | Window / Door |
| `8206` | Grubość paneli 60mm | `—` → — | Window / Door |
| `10001` | packaging - Type 1 | `—` → — | Window / Door |
| `10002` | packaging - Type 2 | `—` → — | Window / Door |
| `15015` | Colour aplikacji woodpodobnej - PANELE | `—` → — | Window / Door |
| `15017` | Kolory ramki paneli drewnianych D-ART | `—` → — | Window / Door |
| `90` | virtual Type dla single sidedek | `—` → — | Window / Door |
| `99` | NieVisible, ale można wprowadzić znając Number artykułu | `—` → — | Window / Door |
| `999` | virtual Type nie pasujący do niczego, ale nie jest to 99 | `—` → — | Window / Door |
| `9000` | ===== Glas ========================== | `—` → — | Window / Door |
| `10000` | ===> FILTER <======================== | `—` → — | Window / Door |
| `10040` | Colour farb Azure | `—` → — | Window / Door |
| `10616` | DZ - hingey doorowe DRE | `—` → — | Window / Door |
| `10711` | Glazing beads wood | `—` → — | Window / Door |
| `10712` | Glazing beads WOOD 78 | `—` → — | Window / Door |
| `10713` | Glazing beads WOOD 88 | `—` → — | Window / Door |
| `10715` | Listwy przyszybowe DUOLINE 68 | `—` → — | Window / Door |
| `10716` | Listwy przyszybowe DUOLINE 78 | `—` → — | Window / Door |
| `10717` | Listwy przyszybowe DUOLINE 88 | `—` → — | Window / Door |
| `10911` | Silly Drewniane | `—` → — | Window / Door |
| `19000` | =====WOODWORK======== | `—` → — | Window / Door |
| `19010` | Colour Drip capów alu Gutmann | `—` → — | Window / Door |
| `19011` | Sandwich panel / boazeryjne DRE | `—` → — | Window / Door |
| `19012` | Panele sandwich / boazeryjne DRA | `—` → — | Window / Door |
| `19020` | Colour Siliconeu | `—` → — | Window / Door |
| `19600` | DZ- handle OUTSIDE | `—` → — | Window / Door |
| `19602` | DZ - Rozety OUTSIDE | `—` → — | Window / Door |
| `19610` | DZ - handle Inside | `—` → — | Window / Door |
| `19612` | DZ - Rozety Inside | `—` → — | Window / Door |



---

## MATERIALART Reference

| Value | Material |
|-------|----------|
| 1 | Wood / System |
| 2 | PVC |
| 3 | Aluminium |
| 4 | Wood |
| 5 | Steel |
| 6 | Mixed / Other |

---

## PRODUKTSYSTEME Reference (Profile Colour Groups)

| Code | Description | Meaning |
|------|-------------|---------|
| `ALU` | Aluminium | Aluminium products with bicolour support |
| `ALU2` | Aluminium bez bikoloru | Aluminium without bicolour |
| `ALUPLAST1` | Profile główne (obustronne) | Main profiles, double-sided |
| `ALUPLAST2` | Listwy przyszybowe | Glass bead strips |
| `ALUPLAST3` | Akcesoria jednostronne | Single-sided accessories |
| `ALUPLAST4` | Akcesoria obustronne | Double-sided accessories |
| `DRE` | Drewno (jeden kolor) | Wood (single colour) |
| `DRUTEX_SPR` | Szprosy | Glazing bars / sprouts |
| `DRUTEX1` | Baza: biała, brąz | PVC base colours: white + brown |
| `DRUTEX2` | Baza: biała | PVC base colour: white only |
| `DRUTEX3` | Baza: biała, brąz, antracyt | PVC base: white + brown + anthracite |
| `DRUTEX4` | Baza: biały, krem, antracyt | PVC base: white + cream + anthracite |
| `PROGI` | Progi | Thresholds / sills |

---

## PRODTYP Column Inventory

| # | Column | Notes |
|---|--------|-------|
| 1 | `PRODUKTTYP` | |
| 2 | `BEZEICHNUNG` | |
| 3 | `MATERIALART` | |
| 4 | `GEHRUNGSART` | |
| 5 | `SORTINDEX` | |
| 6 | `LADENPRODTYP` | |
| 7 | `AUSSENANSICHT` | |
| 8 | `SPRACHID` | |
| 9 | `GEHRUNG` | |
| 10 | `MULLIONLEVEL` | |
| 11 | `LAGERORT` | |
| 12 | `KOPPLUNGSPRODUKTTYPEN` | |
| 13 | `BEZEICHNUNG2` | |
| 14 | `LASTUSER` | |
| 15 | `LASTCHANGE` | |
| 16 | `EDITUSER` | |
| 17 | `EDITSTATUS` | |
| 18 | `ENTEREDBY` | |
| 19 | `ENTRYDATE` | |
| 20 | `OWNER` | |
| 21 | `GLASLEISTENSITZ` | |
| 22 | `ECKVARIANTE1` | |
| 23 | `ECKVARIANTE2` | |
| 24 | `ECKVARIANTE3` | |
| 25 | `ECKVARIANTE4` | |
| 26 | `ECKVARIANTE5` | |
| 27 | `EDITTIME` | |
| 28 | `PRODUKTDESIGNID` | |
| 29 | `ALUDECKSCHALE` | |
| 30 | `HERSTELLERSYSTEM` | |
| 31 | `GRAFIK` | |
| 32 | `TOLERANCEGLASSPLUS` | |
| 33 | `TOLERANCEGLASSMINUS` | |
| 34 | `MACHININGRULESET` | |
| 35 | `BOCKELEMENTTYPE` | |
| 36 | `BOCKELEMENTTYPEMU` | |
| 37 | `COPYSTATUS_SUB_IN_MULLEDUNITS` | |
| 38 | `PRODUCTSYSTEM` | |
| 39 | `DIMENSIONING_METHOD` | |
| 40 | `PRODUCTTYPE_ALUSHELL` | |
| 41 | `ARTICLEID_ALUSHELL_CONTAINER` | |
| 42 | `PRODUCTCLASS_ALUSHELL` | |
| 43 | `DEF_PRODUCTCODE_ALUSHELL` | |
| 44 | `TRANSFORMATION_METHOD_ALUSHELL` | |

---

## Full Raw Data Dump

| PRODUKTTYP | BEZEICHNUNG | MATERIALART | PRODUCTSYSTEM | GRAFIK | SORTINDEX |
|-----------|-------------|-------------|---------------|--------|-----------|
| `1000` | ===== PVC ========================== | `2` (PVC) | `—` | — | 0 |
| `1004` | IGLO HS | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1005` | IGLO SL | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1006` | IGLO SL - NAROZNIK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1007` | IGLO EDGE SLIDE | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1008` | IGLO HS - NAROZNIK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1014` | IGLO HS ALUCOVER | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1100` | IGLO 5 - windows | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1101` | IGLO 5 - PSK | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1102` | IGLO 5 - intermediate profile | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1103` | IGLO 5 - Entrance doors | `2` (PVC) | `—` | — | 0 |
| `1104` | IGLO 5 - Entrance doors - Corner | `2` (PVC) | `—` | — | 0 |
| `1105` | IGLO 5 - intermediate profile PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1106` | IGLO 5 - DRZWI SERWISOWE | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1108` | IGLO 5 - Corner | `2` (PVC) | `—` | — | 0 |
| `1109` | IGLO 5 - sets | `2` (PVC) | `—` | — | 0 |
| `1110` | IGLO 5 CLASSIC - WINDOWS | `2` (PVC) | `—` | — | 0 |
| `1111` | IGLO 5 CLASSIC - PSK | `2` (PVC) | `—` | — | 0 |
| `1118` | IGLO 5 CLASSIC - Corner | `2` (PVC) | `—` | — | 0 |
| `1119` | IGLO 5 CLASSIC - sets | `2` (PVC) | `—` | — | 0 |
| `1120` | IGLO 5 RENO - windows | `2` (PVC) | `—` | — | 0 |
| `1121` | IGLO 5 RENO - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1122` | IGLO 5 RENO - intermediate profile | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1123` | IGLO 5 RENO - Entrance doors | `2` (PVC) | `—` | — | 0 |
| `1124` | IGLO 5 RENO - Entrance doors NAROZNIK | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1126` | IGLO 5 RENO - DRZWI SERWISOWE | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1128` | IGLO 5 RENO - Corner | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1129` | IGLO 5 RENO - sets ??? | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1130` | IGLO 5 CLASSIC RENO - windows | `2` (PVC) | `—` | — | 0 |
| `1131` | IGLO 5 CLASSIC RENO - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1132` | IGLO 5 CLASSIC RENO - intermediate profile | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1138` | IGLO 5 CLASSIC RENO - Corner | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1139` | IGLO 5 CLASSIC RENO - sets ??? | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1140` | IGLO 5 ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1141` | IGLO 5 ADAPT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1143` | IGLO 5 ADAPT - door | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1144` | IGLO 5 ADAPT - door Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1145` | IGLO 5 ADAPT - intermediate profile PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1146` | IGLO 5 ADAPT - DRZWI SERWISOWE | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1148` | IGLO 5 ADAPT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1149` | IGLO 5 ADAPT - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1150` | IGLO 5 CLASSIC ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1151` | IGLO 5 CLASSIC ADAPT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1158` | IGLO 5 CLASSIC ADAPT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1159` | IGLO 5 CLASSIC ADAPT - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1200` | IGLO LIGHT - WINDOWS | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1201` | IGLO LIGHT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1208` | IGLO LIGHT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1209` | IGLO LIGHT - sets | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1210` | IGLO LIGHT RENO - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1211` | IGLO LIGHT RENO - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1218` | IGLO LIGHT RENO - NAROZNIK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1219` | IGLO LIGHT RENO - sets??? | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1250` | IGLO LIGHT ADAPT- windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1258` | IGLO LIGHT ADAPT- NAROZNIK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1259` | IGLO LIGHT ADAPT - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1300` | IGLO ENERGY  - windows | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1301` | IGLO ENERGY  - PSK | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1302` | IGLO ENERGY - PROFIL POŚREDNI | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1303` | IGLO ENERGY  - Entrance doors | `2` (PVC) | `—` | — | 0 |
| `1304` | IGLO ENERGY  - Entrance doors Corner | `2` (PVC) | `—` | — | 0 |
| `1308` | IGLO ENERGY  - Corner | `2` (PVC) | `DRUTEX1` | — | 0 |
| `1309` | IGLO ENERGY - sets | `2` (PVC) | `—` | — | 0 |
| `1310` | IGLO ENERGY CLASSIC - WINDOWS | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1311` | IGLO ENERGY CLASSIC - PSK | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1318` | IGLO ENERGY CLASSIC - Corner | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1319` | IGLO ENERGY CLASSIC - SETS | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1320` | IGLO ENERGY RENO - WINDOWS | `2` (PVC) | `—` | — | 0 |
| `1322` | IGLO ENERGY RENO - PROFIL POŚREDNI | `2` (PVC) | `—` | — | 0 |
| `1323` | IGLO ENERGY RENO - Entrance doors | `2` (PVC) | `—` | — | 0 |
| `1324` | IGLO ENERGY RENO - Entrance doors Corner | `2` (PVC) | `—` | — | 0 |
| `1328` | IGLO ENERGY RENO - Corner | `2` (PVC) | `—` | — | 0 |
| `1329` | IGLO ENERGY RENO - sets ??? | `2` (PVC) | `—` | — | 0 |
| `1330` | IGLO ENERGY CLASSIC RENO - windows | `2` (PVC) | `—` | — | 0 |
| `1338` | IGLO ENERGY CLASSIC RENO - Corner | `2` (PVC) | `—` | — | 0 |
| `1339` | IGLO ENERGY CLASSIC RENO - sets ??? | `2` (PVC) | `—` | — | 0 |
| `1340` | IGLO ENERGY ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1341` | IGLO ENERGY ADAPT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1342` | IGLO ENERGY ADAPT - PROFIL POŚREDNI | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1343` | IGLO ENERGY ADAPT - door | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1344` | IGLO ENERGY ADAPT - door Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1348` | IGLO ENERGY ADAPT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1349` | IGLO ENERGY ADAPT - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1350` | IGLO ENERGY CLASSIC ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1351` | IGLO ENERGY CLASSIC ADAPT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1358` | IGLO ENERGY CLASSIC ADAPT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1359` | IGLO ENERGY CLASSIC ADAPT -  ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1360` | IGLO ENERGY ALUCOVER - windows | `2` (PVC) | `—` | — | 0 |
| `1361` | IGLO ENERGY ALUCOVER - PSK | `2` (PVC) | `—` | — | 0 |
| `1368` | IGLO ENERGY ALUCOVER - Corner | `2` (PVC) | `—` | — | 0 |
| `1369` | IGLO ENERGY ALUCOVER - sets | `2` (PVC) | `—` | — | 0 |
| `1370` | IGLO ENERGY ALUCOVER RENO - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1371` | IGLO ENERGY ALUCOVER RENO - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1378` | IGLO ENERGY ALUCOVER RENO - NAROZNIK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1379` | IGLO ENERGY ALUCOVER RENO - sets | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1380` | IGLO ENERGY ALUCOVER ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1381` | IGLO ENERGY ALUCOVER ADAPT - PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1388` | IGLO ENERGY ALUCOVER ADAPT - Corner | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1389` | IGLO ENERGY ALUCOVER ADAPT - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1400` | IGLO EXT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1409` | IGLO EXT - sets | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1420` | IGLO EXT RENO - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1440` | IGLO EXT ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1500` | IGLO PREMIER - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1509` | IGLO PREMIER - sets | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1520` | IGLO PREMIER RENO - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1540` | IGLO PREMIER ADAPT - windows | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1600` | IGLO EDGE - WINDOWS | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1601` | IGLO EDGE  - PSK | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1602` | IGLO EDGE  - PROFIL POŚREDNI | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1603` | IGLO EDGE - ENTRANCE DOORS | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1608` | IGLO EDGE - CORNER | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1609` | IGLO EDGE - SETS | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1620` | IGLO EDGE RENO | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1623` | IGLO EDGE RENO - DRZWI WEJŚCIOWE | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1629` | IGLO EDGE RENO - ZESTAWY | `2` (PVC) | `DRUTEX3` | — | 0 |
| `1700` | NEO 76 AD | `2` (PVC) | `—` | — | 0 |
| `1701` | NEO 76 AD - PSK | `2` (PVC) | `—` | — | 0 |
| `1702` | NEO 76 AD - PROFIL POŚREDNI | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1703` | NEO 76 AD - DRZWI WEJŚCIOWE | `2` (PVC) | `—` | — | 0 |
| `1704` | NEO 76 AD - DRZWI WEJŚCIOWE - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1705` | NEO 76 AD - PROFIL POŚREDNI PSK | `2` (PVC) | `DRUTEX2` | — | 0 |
| `1708` | NEO 76 AD - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1709` | NEO 76 AD - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1710` | NEO 76 MD | `2` (PVC) | `—` | — | 0 |
| `1711` | NEO 76 MD - PSK | `2` (PVC) | `—` | — | 0 |
| `1712` | NEO 76 MD - PROFIL POŚREDNI | `2` (PVC) | `—` | — | 0 |
| `1713` | NEO 76 MD - FRONT DOOR | `2` (PVC) | `—` | — | 0 |
| `1714` | NEO 76 MD - DRZWI WEJŚCIOWE - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1715` | NEO 76 MD - PROFIL POŚREDNI PSK | `2` (PVC) | `—` | — | 0 |
| `1718` | NEO 76 MD - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1719` | NEO 76 MD - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1720` | NEO 76 MD RENO | `2` (PVC) | `—` | — | 0 |
| `1721` | NEO 76 MD RENO - PSK | `2` (PVC) | `—` | — | 0 |
| `1722` | NEO 76 MD RENO - PROFIL POŚREDNI | `2` (PVC) | `—` | — | 0 |
| `1723` | NEO 76 MD RENO - DRZWI WEJŚCIOWE | `2` (PVC) | `—` | — | 0 |
| `1724` | NEO 76 MD RENO - DRZWI WEJŚCIOWE - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1725` | NEO 76 MD RENO - PROFIL POŚREDNI PSK | `2` (PVC) | `—` | — | 0 |
| `1728` | NEO 76 MD RENO - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1729` | NEO 76 MD RENO - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1730` | NEO 76 MD MONO | `2` (PVC) | `—` | — | 0 |
| `1731` | NEO 76 MD MONO - PSK | `2` (PVC) | `—` | — | 0 |
| `1732` | NEO 76 MD MONO - PROFIL POŚREDNI | `2` (PVC) | `—` | — | 0 |
| `1733` | NEO 76 MD MONO - DRZWI WEJŚCIOWE | `2` (PVC) | `—` | — | 0 |
| `1734` | NEO 76 MD MONO - DRZWI WEJŚCIOWE - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1735` | NEO 76 MD MONO - PROFIL POŚREDNI PSK | `2` (PVC) | `—` | — | 0 |
| `1738` | NEO 76 MD MONO - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1739` | NEO 76 MD MONO - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1750` | IDEAL 7000 NL | `2` (PVC) | `—` | — | 0 |
| `1751` | IDEAL 7000 NL - PSK | `2` (PVC) | `—` | — | 0 |
| `1752` | IDEAL 7000 NL - PROFIL POŚREDNI | `2` (PVC) | `—` | — | 0 |
| `1753` | IDEAL 7000 NL - DRZWI WEJŚCIOWE | `2` (PVC) | `—` | — | 0 |
| `1754` | IDEAL 7000 NL - DRZWI WEJŚCIOWE - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1755` | IDEAL 7000 NL - PROFIL POŚREDNI PSK | `2` (PVC) | `—` | — | 0 |
| `1756` | IDEAL 7000 NL - OKNA OTW NA ZEWN | `2` (PVC) | `—` | — | 0 |
| `1758` | IDEAL 7000 NL - NAROŻNIK | `2` (PVC) | `—` | — | 0 |
| `1759` | IDEAL 7000 NL - ZESTAWY | `2` (PVC) | `—` | — | 0 |
| `1990` | GLASS BALUSTRADE | `3` (Aluminium) | `—` | — | 0 |
| `2000` | ===== WOOD ========================== | `1` (Wood / System) | `—` | — | 0 |
| `2100` | SOFTLINE68 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2101` | SOFTLINE68 PSK | `1` (Wood / System) | `—` | — | 0 |
| `2103` | SOFTLINE68 Entrance doors | `1` (Wood / System) | `—` | — | 0 |
| `2104` | SOFTLINE68 HS | `1` (Wood / System) | `—` | — | 0 |
| `2108` | SOFTLINE68 Bifold doors | `1` (Wood / System) | `—` | — | 0 |
| `2109` | SOFTLINE68 sets | `1` (Wood / System) | `—` | — | 0 |
| `2200` | SOFTLINE78 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2201` | SOFTLINE78 PSK | `1` (Wood / System) | `—` | — | 0 |
| `2203` | SOFTLINE78 Entrance doors | `1` (Wood / System) | `—` | — | 0 |
| `2204` | SOFTLINE78 HS | `1` (Wood / System) | `—` | — | 0 |
| `2209` | SOFTLINE78 sets | `1` (Wood / System) | `—` | — | 0 |
| `2300` | SOFTLINE88 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2301` | SOFTLINE88 PSK | `1` (Wood / System) | `—` | — | 0 |
| `2303` | SOFTLINE88 FRONT DOOR | `1` (Wood / System) | `—` | — | 0 |
| `2304` | SOFTLINE88 HS | `1` (Wood / System) | `—` | — | 0 |
| `2309` | SOFTLINE88 sets | `1` (Wood / System) | `—` | — | 0 |
| `2500` | ===== DUOLINE ========================== | `1` (Wood / System) | `—` | — | 0 |
| `2600` | DUOLINE68 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2601` | DUOLINE68 PSK | `1` (Wood / System) | `—` | — | 0 |
| `2604` | DUOLINE68 HS | `1` (Wood / System) | `—` | — | 0 |
| `2609` | DUOLINE68 sets | `1` (Wood / System) | `—` | — | 0 |
| `2700` | DUOLINE78 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2701` | DUOLINE 78 PSK | `1` (Wood / System) | `—` | — | 0 |
| `2704` | DUOLINE78 HS | `1` (Wood / System) | `—` | — | 0 |
| `2709` | DUOLINE78 sets | `1` (Wood / System) | `—` | — | 0 |
| `2800` | DUOLINE88 windows, balcony doors | `1` (Wood / System) | `—` | — | 0 |
| `2804` | DUOLINE88 HS | `1` (Wood / System) | `—` | — | 0 |
| `2809` | DUOLINE88 sets | `1` (Wood / System) | `—` | — | 0 |
| `3000` | ===== ALU ========================== | `3` (Aluminium) | `—` | — | 0 |
| `3100` | MB45 windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3102` | MB45 swing doors | `3` (Aluminium) | `—` | — | 0 |
| `3103` | MB45 door | `3` (Aluminium) | `—` | — | 0 |
| `3104` | MB45 door - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3105` | MB45 door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3106` | MB45 sliding windows RĘCZNIE NA BOK | `3` (Aluminium) | `—` | — | 0 |
| `3107` | MB45 sliding windows RĘCZNIE DO GÓRY | `3` (Aluminium) | `—` | — | 0 |
| `3108` | MB45 windows, balcony doors - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3109` | MB45 sets | `3` (Aluminium) | `—` | — | 0 |
| `3150` | MB70 windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3151` | MB70 PSK | `3` (Aluminium) | `—` | — | 0 |
| `3153` | MB70 door | `3` (Aluminium) | `—` | — | 0 |
| `3155` | MB70 door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3159` | MB70 sets | `3` (Aluminium) | `—` | — | 0 |
| `3200` | MB79N Windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3201` | MB79N PSK | `3` (Aluminium) | `—` | — | 0 |
| `3203` | MB79N Door | `3` (Aluminium) | `—` | — | 0 |
| `3204` | MB79 SI door - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3205` | MB79N Door with sidelite | `3` (Aluminium) | `—` | — | 0 |
| `3208` | MB79 SI windows, balcony doors - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3209` | MB79N Sets | `3` (Aluminium) | `—` | — | 0 |
| `3240` | MB79N ADAPT | `3` (Aluminium) | `—` | — | 0 |
| `3249` | MB79N ADAPT ZESTAWY | `3` (Aluminium) | `—` | — | 0 |
| `3270` | MB79 SI renovation windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3271` | MB79NR RENOWACJA PSK | `3` (Aluminium) | `—` | — | 0 |
| `3273` | MB79N RENOWACJA DRZWI | `3` (Aluminium) | `—` | — | 0 |
| `3275` | MB79N RENOWACJA DRZWI Z NAŚWIETLEM | `3` (Aluminium) | `—` | — | 0 |
| `3278` | MB79 SI RENOVATION OF WINDOWS, BALCONY DOORS - CORNER | `3` (Aluminium) | `—` | — | 0 |
| `3279` | MB79N RENOWACJA ZESTAWY | `3` (Aluminium) | `—` | — | 0 |
| `3300` | MB86 SI windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3301` | MB86 SI PSK | `3` (Aluminium) | `—` | — | 0 |
| `3303` | MB86 SI door | `3` (Aluminium) | `—` | — | 0 |
| `3305` | MB86 SI door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3309` | MB86 SI sets | `3` (Aluminium) | `—` | — | 0 |
| `3320` | MB86 SI renovation windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3350` | MB86N SI windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3351` | MB86N SI PSK | `3` (Aluminium) | `—` | — | 0 |
| `3353` | MB86N SI door | `3` (Aluminium) | `—` | — | 0 |
| `3354` | MB86N SI door - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3355` | MB86N SI door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3358` | MB86N SI windows, balcony doors - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3359` | MB86N SI sets | `3` (Aluminium) | `—` | — | 0 |
| `3370` | MB86N SI renovation windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3378` | MB86N SI renovation windows, balcony doors - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3400` | GENESIS windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3401` | GENESIS PSK | `3` (Aluminium) | `—` | — | 0 |
| `3403` | GENESIS door | `3` (Aluminium) | `—` | — | 0 |
| `3405` | GENESIS door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3409` | GENESIS sets | `3` (Aluminium) | `—` | — | 0 |
| `3450` | MB86N PIVOT DOOR | `3` (Aluminium) | `—` | — | 0 |
| `3453` | MB86N PIVOT DRZWI | `3` (Aluminium) | `—` | — | 0 |
| `3455` | MB86N PIVOT DRZWI Z NAŚWIETLEM | `3` (Aluminium) | `—` | — | 0 |
| `3500` | STAR windows, balcony doors | `3` (Aluminium) | `—` | — | 0 |
| `3501` | STAR PSK | `3` (Aluminium) | `—` | — | 0 |
| `3503` | STAR door | `3` (Aluminium) | `—` | — | 0 |
| `3505` | STAR door with fanlight | `3` (Aluminium) | `—` | — | 0 |
| `3509` | STAR sets | `3` (Aluminium) | `—` | — | 0 |
| `3600` | MB78 EI30 Window | `3` (Aluminium) | `—` | — | 0 |
| `3603` | MB78 EI30 door | `3` (Aluminium) | `—` | — | 0 |
| `3605` | MB78 EI30 DRZWI Z NAŚWIETLEM | `3` (Aluminium) | `—` | — | 0 |
| `3609` | MB78 EI30 sets | `3` (Aluminium) | `—` | — | 0 |
| `3650` | MB60 EI30 OKNO | `3` (Aluminium) | `—` | — | 0 |
| `3653` | MB60 EI30 DRZWI | `3` (Aluminium) | `—` | — | 0 |
| `3659` | MB60 EI30 ZESTAWY | `3` (Aluminium) | `—` | — | 0 |
| `3700` | MB78 EI60 Window | `3` (Aluminium) | `—` | — | 0 |
| `3703` | MB78 EI60 door | `3` (Aluminium) | `—` | — | 0 |
| `3705` | MB78 EI60 DRZWI Z NAŚWIETLEM | `3` (Aluminium) | `—` | — | 0 |
| `3709` | MB78 EI60 sets | `3` (Aluminium) | `—` | — | 0 |
| `3804` | MB77 HS(HI) | `3` (Aluminium) | `—` | — | 0 |
| `3805` | MB77 HS(HI) - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3814` | MB SLIDE | `3` (Aluminium) | `—` | — | 0 |
| `3815` | MB SLIDE - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3824` | SLIDE GLASS | `3` (Aluminium) | `—` | — | 0 |
| `3854` | MB77 HS(HI) MONORAIL | `3` (Aluminium) | `—` | — | 0 |
| `3855` | MB77 HS(HI) MONORAIL - NAROZNIK | `3` (Aluminium) | `—` | — | 0 |
| `3900` | MB59S - Automatically slide doors | `3` (Aluminium) | `—` | — | 0 |
| `3904` | COR VISION PLUS | `3` (Aluminium) | `—` | — | 0 |
| `3908` | MB86 FOLD LINE (Bifold doors) | `3` (Aluminium) | `—` | — | 0 |
| `3909` | MB86 FOLD LINE HD (Bifold doors) | `3` (Aluminium) | `—` | — | 0 |
| `3910` | MB86 FOLD LINE HD (Bifold doors) - Corner | `3` (Aluminium) | `—` | — | 0 |
| `3950` | MB45- Automatically slide doors | `3` (Aluminium) | `—` | — | 0 |
| `3960` | MB79N  Automatically slide doors | `3` (Aluminium) | `—` | — | 0 |
| `3990` | MB-GLASS BARRIER | `3` (Aluminium) | `—` | — | 0 |
| `4000` | ===== Roller shutter ========================== | `1` (Wood / System) | `—` | — | 0 |
| `4001` | Outdoor shutters | `2` (PVC) | `—` | — | 0 |
| `4002` | Kolor listwy dolnej moskitiery RN_175 ELITE | `2` (PVC) | `—` | — | 0 |
| `4009` | Kolor skrzynek RA45_205 | `2` (PVC) | `—` | — | 0 |
| `4010` | Kolory siatki moskitiery | `2` (PVC) | `—` | — | 0 |
| `4011` | Curtain color 37 | `2` (PVC) | `—` | — | 0 |
| `4012` | Curtain color 42 | `2` (PVC) | `—` | — | 0 |
| `4013` | Curtain color 55 | `2` (PVC) | `—` | — | 0 |
| `4014` | Colour guides aluminiowych to roller shutters RS standard | `2` (PVC) | `—` | — | 0 |
| `4015` | Colour guides aluminiowych to roller shutters RS non-standar | `2` (PVC) | `—` | — | 0 |
| `4016` | Colour guides aluminiowych to roller shutters RA | `2` (PVC) | `—` | — | 0 |
| `4017` | Colour guides PVC to roller shutters | `2` (PVC) | `—` | — | 0 |
| `4018` | Colour listew końcowych armoura standard | `2` (PVC) | `—` | — | 0 |
| `4019` | Colour listew końcowych armoura non-standard | `2` (PVC) | `—` | — | 0 |
| `4020` | Colour zakończeń guides to roller shutters | `2` (PVC) | `—` | — | 0 |
| `4021` | Colour skrzynek RA45 | `2` (PVC) | `—` | — | 0 |
| `4022` | Colour skrzynek RAOW | `2` (PVC) | `—` | — | 0 |
| `4023` | Colour skrzynek RA90 | `2` (PVC) | `—` | — | 0 |
| `4024` | Colour skrzynek RN | `2` (PVC) | `—` | — | 0 |
| `4025` | Colour skrzynek RSW/RSZ | `2` (PVC) | `—` | — | 0 |
| `4026` | Colour ANGLEów to roller shutters out (bez RSZ) | `2` (PVC) | `—` | — | 0 |
| `4027` | Colour ANGLEów to roller shutters ins | `2` (PVC) | `—` | — | 0 |
| `4028` | Colour ANGLEów ALU to roller shutters RSZ | `2` (PVC) | `—` | — | 0 |
| `4029` | Colour Bufferów 20mm | `2` (PVC) | `—` | — | 0 |
| `4030` | Colour Bufferów 40mm | `2` (PVC) | `—` | — | 0 |
| `4031` | Colour adapterów RSW 956 / 957 | `2` (PVC) | `—` | — | 0 |
| `4032` | Colour adapterów RSW 969 | `2` (PVC) | `—` | — | 0 |
| `4033` | Kolor zamka baskwilowego | `2` (PVC) | `—` | — | 0 |
| `4034` | Colour guides drewnianych to roller shutters | `2` (PVC) | `—` | — | 0 |
| `4035` | Colour bottom slat Mosquito nets RS standard | `2` (PVC) | `—` | — | 0 |
| `4036` | Colour bottom slat Mosquito nets RS non-standard | `2` (PVC) | `—` | — | 0 |
| `4037` | Colour bottom slat Mosquito nets RA/RN standard | `2` (PVC) | `—` | — | 0 |
| `4038` | Colour bottom slat Mosquito nets RA/RN non-standard | `2` (PVC) | `—` | — | 0 |
| `4039` | Colour bottom slat Mosquito nets RN_175 SKS | `2` (PVC) | `—` | — | 0 |
| `4040` | Colour elementów rolet aluminiowych non-standard | `2` (PVC) | `—` | — | 0 |
| `4041` | Colour profilu rewizyjnego RS PVC | `2` (PVC) | `—` | — | 0 |
| `4042` | Colour profilu rewizyjnego RS ALU | `2` (PVC) | `—` | — | 0 |
| `4043` | Colour guides aluminiowych to roller shutters RN | `2` (PVC) | `—` | — | 0 |
| `4044` | Kolor lameli do paneli D-Art(panele nakładkowe ELEGANCE MB86 | `2` (PVC) | `—` | — | 0 |
| `4045` | Kolor paneli D-Art (panele nakładkowe MB86N) | `2` (PVC) | `—` | — | 0 |
| `4046` | Kolory pochwytu okrągłego D-Art (panele nakładkowe MB86N) | `2` (PVC) | `—` | — | 0 |
| `4047` | Kolory listwy dolnej D-Art (panele nakładkowe MB86N) | `2` (PVC) | `—` | — | 0 |
| `4048` | Kolor buforów 28mm | `2` (PVC) | `—` | — | 0 |
| `4049` | Kolor zaślepek obudowy bocznej (RN215/225) | `2` (PVC) | `—` | — | 0 |
| `4050` | Kolor zaślepek obudowy bocznej (RN175 SKS) | `2` (PVC) | `—` | — | 0 |
| `4051` | Roller shutter RN bulk (filter) | `2` (PVC) | `—` | — | 0 |
| `4052` | Roller shutter RA bulk (filter) | `2` (PVC) | `—` | — | 0 |
| `4053` | Roller shutter RSW bulk (filter) | `2` (PVC) | `—` | — | 0 |
| `4054` | Roller shutter RSZ bulk (filter) | `2` (PVC) | `—` | — | 0 |
| `4055` | Roleta RNV luzem (filtr) | `2` (PVC) | `—` | — | 0 |
| `4056` | Roleta RDZ luzem (filtr) | `2` (PVC) | `—` | — | 0 |
| `4057` | Kolor panelu PIVOT 8 - VIP Rustico | `2` (PVC) | `—` | — | 0 |
| `4058` | Kolor panelu PIVOT 7 - Industrial Bronze | `2` (PVC) | `—` | — | 0 |
| `4059` | Kolor paneli C - Classic (VP Trend) | `2` (PVC) | `—` | — | 0 |
| `4060` | Kolor paneli L - Lamelowe (VP Trend) | `2` (PVC) | `—` | — | 0 |
| `4061` | Roller shutter RN for window PVC (filter) | `2` (PVC) | `—` | — | 0 |
| `4062` | Roller shutter RA for window PVC (filter) | `2` (PVC) | `—` | — | 0 |
| `4063` | Roller shutter RSW for window PVC (filter) | `2` (PVC) | `—` | — | 0 |
| `4064` | Roller shutter RSZ for window PVC (filter) | `2` (PVC) | `—` | — | 0 |
| `4065` | Roleta RNV do okna PVC (filtr) | `2` (PVC) | `—` | — | 0 |
| `4071` | Roller shutter RN for window ALU (filter) | `2` (PVC) | `—` | — | 0 |
| `4072` | Roller shutter RA for window ALU (filter) | `2` (PVC) | `—` | — | 0 |
| `4073` | Roller shutter RSW for window ALU (filter) | `2` (PVC) | `—` | — | 0 |
| `4074` | Roller shutter RSZ for window ALU (filter) | `2` (PVC) | `—` | — | 0 |
| `4075` | Roleta RNV do okna ALU (filtr) | `2` (PVC) | `—` | — | 0 |
| `4081` | Roller shutter RN for window DRE (filter) | `2` (PVC) | `—` | — | 0 |
| `4082` | Roller shutter RA for window DRE (filter) | `2` (PVC) | `—` | — | 0 |
| `4083` | Roller shutter RSW for window DRE (filter) | `2` (PVC) | `—` | — | 0 |
| `4084` | Roller shutter RSZ for window DRE (filter) | `2` (PVC) | `—` | — | 0 |
| `4085` | Roleta RNV do okna DRE (filtr) | `2` (PVC) | `—` | — | 0 |
| `4091` | Roller shutter RN for window DRA (filter) | `2` (PVC) | `—` | — | 0 |
| `4092` | Roller shutter RA for window DRA (filter) | `2` (PVC) | `—` | — | 0 |
| `4093` | Roller shutter RSW for window DRA (filter) | `2` (PVC) | `—` | — | 0 |
| `4094` | Roller shutter RSZ for window DRA (filter) | `2` (PVC) | `—` | — | 0 |
| `4095` | Roleta RNV do okna DRA (filtr) | `2` (PVC) | `—` | — | 0 |
| `4098` | Color of the flush-mounted strip (styrofoam clinker) | `2` (PVC) | `—` | — | 0 |
| `4099` | Kolor boków rolet RA90 (malowane) | `2` (PVC) | `—` | — | 0 |
| `4100` | ===== Facade blinds ========================== | `2` (PVC) | `—` | — | 0 |
| `4101` | Facade blinds | `2` (PVC) | `—` | — | 0 |
| `4109` | Żaluzje fasadowe - prowadnice _R | `2` (PVC) | `—` | — | 0 |
| `4110` | Żaluzje fasadowe - prowadnice | `2` (PVC) | `—` | — | 0 |
| `4111` | Slat color C80 | `2` (PVC) | `—` | — | 0 |
| `4115` | Colour guides aluminiowych do venetian blinds ZFA | `2` (PVC) | `—` | — | 0 |
| `4116` | Colour guides aluminiowych do venetian blinds ZFS | `2` (PVC) | `—` | — | 0 |
| `4117` | Colour guides PVC do venetian blinds ZFS | `2` (PVC) | `—` | — | 0 |
| `4120` | Colour zakończeń guides do venetian blinds | `2` (PVC) | `—` | — | 0 |
| `4121` | Colour skrzynek ZFA | `2` (PVC) | `—` | — | 0 |
| `4122` | Colour skrzynek ZFS | `2` (PVC) | `—` | — | 0 |
| `4130` | Colour elementów zabulkji aluminiowych non-standard | `2` (PVC) | `—` | — | 0 |
| `4200` | ===== Cassonetto ========================== | `2` (PVC) | `—` | — | 0 |
| `4201` | Cassonetto | `2` (PVC) | `—` | — | 0 |
| `4250` | ===== Żaluzje Venus ========================== | `2` (PVC) | `—` | — | 0 |
| `4251` | Żaluzje Venus | `2` (PVC) | `—` | — | 0 |
| `4255` | Żaluzje Venus - kolor rynny górnej i obciąznika | `2` (PVC) | `—` | — | 0 |
| `4400` | ===== Insect screen ========================== | `2` (PVC) | `—` | — | 0 |
| `4401` | Pleated insect screen | `2` (PVC) | `—` | — | 0 |
| `4402` | Mosquito nets | `2` (PVC) | `—` | — | 0 |
| `4403` | Moskitiera drzwiowa | `2` (PVC) | `—` | — | 0 |
| `4404` | Moskitiera otwierana - kolory niestandardowe | `2` (PVC) | `—` | — | 0 |
| `4405` | Pleated insect screen Top Zag | `2` (PVC) | `—` | — | 0 |
| `4406` | Pleated insect screen Click-Roll | `2` (PVC) | `—` | — | 0 |
| `4407` | Mosquito Flex-Screen | `2` (PVC) | `—` | — | 0 |
| `5000` | ===== iQuote ========================== | `1` (Wood / System) | `—` | — | 0 |
| `5001` | iQuote - accessories PVC | `2` (PVC) | `—` | — | 0 |
| `5002` | iQuote - accessories DRE | `1` (Wood / System) | `—` | — | 0 |
| `5003` | iQuote - accessories DRA | `1` (Wood / System) | `—` | — | 0 |
| `6050` | Kolor lameli - panele ALU (R_) D101/O102/W645 | `3` (Aluminium) | `—` | — | 0 |
| `6051` | Kolor lameli - panele ALU (R_) RAL/SPEC | `3` (Aluminium) | `—` | — | 0 |
| `8000` | ======== Bramy ================================= | `1` (Wood / System) | `—` | — | 0 |
| `8011` | Garage doors | `1` (Wood / System) | `—` | — | 0 |
| `8012` | Bramy przemysłowe | `1` (Wood / System) | `—` | — | 0 |
| `8101` | Kolory paneli grubość 60 - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8102` | Kolory paneli grubość 60 - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8112` | Kolory paneli gr 40 Wysokie Woodgrain - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8113` | Kolory paneli gr 40 Niskie Woodgrain - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8114` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8115` | Kolory paneli gr 40 Wysokie Woodgrain - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8116` | Kolory paneli gr 40 Niskie Woodgrain - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8117` | Kolory paneli gr 40 Bez przetłoczeń Woodgrain-niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8122` | Kolory paneli gr 40 Wysokie Gladkie - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8123` | Kolory paneli gr 40 Niskie Gładkie - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8124` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - standardowe | `1` (Wood / System) | `—` | — | 0 |
| `8125` | Kolory paneli gr 40 Wysokie Gladkie - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8126` | Kolory paneli gr 40 Niskie Gładkie - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8127` | Kolory paneli gr 40 Bez przetłoczeń Gładkie - niestandardowe | `1` (Wood / System) | `—` | — | 0 |
| `8130` | Kolory paneli struktura wew | `1` (Wood / System) | `—` | — | 0 |
| `8131` | Kolory prowadnic/ościeżnic - Bramy standard | `1` (Wood / System) | `—` | — | 0 |
| `8132` | Kolory okien - Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8133` | Kolory okien stal nierdzewna- Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8135` | Kolory kratek wentylacyjnych - Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8136` | Kolory okien czarny- Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8137` | Kolory okien biały- Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8138` | Kolory okien aluminium- Bramy | `1` (Wood / System) | `—` | — | 0 |
| `8139` | Kolory prowadnic/ościeżnic - Bramy renowacja | `1` (Wood / System) | `—` | — | 0 |
| `8140` | Kolory podwieszeń bramy | `1` (Wood / System) | `—` | — | 0 |
| `8145` | Kolory zawiasów/okuć | `1` (Wood / System) | `—` | — | 0 |
| `8150` | Type of glazing window M1 - gate | `1` (Wood / System) | `—` | — | 0 |
| `8151` | Type of glazing window P6,K2,O2,P4,P3,P2 - gate | `1` (Wood / System) | `—` | — | 0 |
| `8200` | Przetłoczenia gr. 40 | `1` (Wood / System) | `—` | — | 0 |
| `8201` | Przetłoczenia gr. 60 | `1` (Wood / System) | `—` | — | 0 |
| `8205` | Grubość paneli 40mm | `1` (Wood / System) | `—` | — | 0 |
| `8206` | Grubość paneli 60mm | `1` (Wood / System) | `—` | — | 0 |
| `10001` | packaging - Type 1 | `1` (Wood / System) | `—` | — | 0 |
| `10002` | packaging - Type 2 | `1` (Wood / System) | `—` | — | 0 |
| `10028` | Colour klamek EXT | `2` (PVC) | `—` | — | 0 |
| `10320` | Gluing the glazing unit in the sash | `2` (PVC) | `—` | — | 0 |
| `10321` | Gluing the glazing unit in the fix | `2` (PVC) | `—` | — | 0 |
| `10322` | Gluing the glazing unit in the RC2 fix | `2` (PVC) | `—` | — | 0 |
| `10323` | Gluing the package in the passive sash on the handle side | `2` (PVC) | `—` | — | 0 |
| `10350` | Kolory - wrzutka na listy do wypełnień GAVA88001 | `2` (PVC) | `—` | — | 0 |
| `10351` | Kolory - wrzutka na listy do wypełnień SW-02 | `2` (PVC) | `—` | — | 0 |
| `10400` | Kolor drzwi dla pupila (filtr) - biale | `2` (PVC) | `—` | — | 0 |
| `10401` | Kolor drzwi dla pupila (filtr) - biale,braz | `2` (PVC) | `—` | — | 0 |
| `10402` | Kolor drzwi dla pupila (filtr) - biale,braz,antracyt | `2` (PVC) | `—` | — | 0 |
| `10801` | stick-on grills | `2` (PVC) | `—` | — | 0 |
| `10803` | stick-on grills ALU | `3` (Aluminium) | `—` | — | 0 |
| `11600` | Filtr - kolor aplikacji - panel | `3` (Aluminium) | `—` | — | 0 |
| `11601` | Filtr - kolor ramki ozdobnej - panel | `3` (Aluminium) | `—` | — | 0 |
| `11602` | Filtr - kolor profilu ozdobnego pochwytu - panel | `3` (Aluminium) | `—` | — | 0 |
| `11603` | Filtr - kolor aplikacji - panel PIVOT 3 | `3` (Aluminium) | `—` | — | 0 |
| `11604` | Filtr - kolor aplikacji (Ral 9005 mat)- panel PIVOT 7 | `3` (Aluminium) | `—` | — | 0 |
| `11605` | Filtr - kolor systemowy (właściwość 1100 fitr) panel PIVOT 8 | `3` (Aluminium) | `—` | — | 0 |
| `11606` | Filtr - kolor aplikacji panel PIVOT 8 - (VIP Amber) | `3` (Aluminium) | `—` | — | 0 |
| `15015` | Colour aplikacji woodpodobnej - PANELE | `1` (Wood / System) | `—` | — | 0 |
| `15017` | Kolory ramki paneli drewnianych D-ART | `1` (Wood / System) | `—` | — | 0 |
| `15018` | Kolory aplikacji panele ALU (R_) D101/O102/W645 | `3` (Aluminium) | `—` | — | 0 |
| `15019` | Kolory aplikacji panele ALU (R_) RAL/SPEC | `3` (Aluminium) | `—` | — | 0 |
| `15031` | Piaskowania Type 1 (do szyb squareowych) | `2` (PVC) | `—` | — | 0 |
| `15032` | Piaskowania Type 2 (do szyb prostoAnglenych) | `2` (PVC) | `—` | — | 0 |
| `15035` | Piaskowania typ dx_32 | `2` (PVC) | `—` | — | 0 |
| `15036` | Piaskowania typ dx_33 | `2` (PVC) | `—` | — | 0 |
| `15037` | Piaskowania typ dx_34 | `2` (PVC) | `—` | — | 0 |
| `15038` | Piaskowania typ dx_35 | `2` (PVC) | `—` | — | 0 |
| `90` | virtual Type dla single sidedek | `1` (Wood / System) | `—` | — | 90 |
| `99` | NieVisible, ale można wprowadzić znając Number artykułu | `1` (Wood / System) | `—` | — | 99 |
| `999` | virtual Type nie pasujący do niczego, ale nie jest to 99 | `1` (Wood / System) | `—` | — | 99 |
| `6001` | ALU - Extensions PVC to ALU | `3` (Aluminium) | `—` | — | 6001 |
| `9000` | ===== Glas ========================== | `1` (Wood / System) | `—` | — | 9000 |
| `9999` | Glass | `2` (PVC) | `—` | — | 9999 |
| `10000` | ===> FILTER <======================== | `1` (Wood / System) | `—` | — | 10000 |
| `10011` | PVC - handle malowane | `2` (PVC) | `—` | — | 10011 |
| `10012` | PVC - Hoppe handle | `2` (PVC) | `—` | — | 10012 |
| `10013` | PVC - Hoppe handle TOULON, HAMBURG | `2` (PVC) | `—` | — | 10013 |
| `10015` | PVC - handle PZ malowane | `2` (PVC) | `—` | — | 10015 |
| `10017` | PVC - handle PSK sterowanie ręczne | `2` (PVC) | `—` | — | 10017 |
| `10018` | PVC - handle PSK sterowanie automatyczne | `2` (PVC) | `—` | — | 10018 |
| `10019` | PVC - HS handleT | `2` (PVC) | `—` | — | 10019 |
| `10020` | Filter - handle FS sash czynne | `2` (PVC) | `—` | — | 10020 |
| `10021` | Filter - handle FS passive sash | `2` (PVC) | `—` | — | 10021 |
| `10022` | PVC - Colour zaslepek odwodnien | `2` (PVC) | `—` | — | 10022 |
| `10023` | PVC - Colour profilu bazowego | `2` (PVC) | `—` | — | 10023 |
| `10024` | PVC - Color of the knob for the rigid chain | `2` (PVC) | `—` | — | 10024 |
| `10025` | Colour Mountów do Latchów Balcony doorowych | `2` (PVC) | `—` | — | 10025 |
| `10026` | Colour blokady turnarcia | `2` (PVC) | `—` | — | 10026 |
| `10027` | Colour Multi Vent | `2` (PVC) | `—` | — | 10027 |
| `10029` | Kolory blokady rozwarcia ALU | `3` (Aluminium) | `—` | — | 10029 |
| `10030` | PVC - Artykuły w Colourach podst.: white / brown | `2` (PVC) | `—` | — | 10030 |
| `10033` | PVC - Artykuły w kolorach podst.: czarny | `2` (PVC) | `—` | — | 10030 |
| `10031` | PVC - Artykuły w Colourach podst.: white / veneer | `2` (PVC) | `—` | — | 10031 |
| `10032` | Kolory uchwytów do zatrzasków balkonowych DeLuxe | `2` (PVC) | `—` | — | 10032 |
| `10034` | PVC - Kolory zaslepek odwodnien monoblock | `2` (PVC) | `—` | — | 10034 |
| `10040` | Colour farb Azure | `1` (Wood / System) | `—` | — | 10040 |
| `10041` | Colour farb RAL bez wskazania struktury | `3` (Aluminium) | `—` | — | 10041 |
| `10042` | Colour farb RAL ze wskazaniem struktury | `3` (Aluminium) | `—` | — | 10042 |
| `10050` | Colour progów HST HH.. | `2` (PVC) | `—` | — | 10050 |
| `10051` | Colour progów for windows | `2` (PVC) | `—` | — | 10051 |
| `10052` | Colour progów HST EcoPass | `2` (PVC) | `—` | — | 10052 |
| `10060` | Colour bumperów HST | `2` (PVC) | `—` | — | 10060 |
| `10061` | Colour akcesoriów HST | `2` (PVC) | `—` | — | 10061 |
| `10062` | Colour profili bez uszczelek HST | `2` (PVC) | `—` | — | 10062 |
| `10070` | Colour zaślepek movable post V70,V82,A70 | `2` (PVC) | `—` | — | 10070 |
| `10071` | Colour zaślepek movable post V90 | `2` (PVC) | `—` | — | 10071 |
| `10080` | Colour otwieraczy naświetli | `2` (PVC) | `—` | — | 10080 |
| `10081` | Colour otwieraczy naświetli (FLEXIBLE CABLE) | `2` (PVC) | `—` | — | 10081 |
| `10082` | Kolory otwieraczy naświetli FL190 (CIĘGNO GIĘTKIE) | `2` (PVC) | `—` | — | 10082 |
| `10083` | Kolory otwieraczy naświetli FL190 (KORBA) | `2` (PVC) | `—` | — | 10083 |
| `10084` | Kolory otwieraczy naświetli FL190 | `2` (PVC) | `—` | — | 10084 |
| `10085` | Colour Sillów insnetrznych | `2` (PVC) | `—` | — | 10085 |
| `10100` | Colour Grillów 8mm | `2` (PVC) | `—` | — | 10100 |
| `10101` | Colour Grillów 18mm | `2` (PVC) | `—` | — | 10101 |
| `10102` | Colour Grillów 26mm | `2` (PVC) | `—` | — | 10102 |
| `10103` | Colour Grillów 45mm | `2` (PVC) | `—` | — | 10103 |
| `10104` | Colour osłonek FS ALU | `3` (Aluminium) | `—` | — | 10104 |
| `10105` | Colour nakładek ALU | `3` (Aluminium) | `—` | — | 10105 |
| `10106` | Colour Ventilationów RENSON PVC | `2` (PVC) | `—` | — | 10106 |
| `10107` | Colour Ventilationów RENSON ALU | `3` (Aluminium) | `—` | — | 10107 |
| `10108` | Ventilations downdrafts RADAKS/REGEL | `2` (PVC) | `—` | — | 10108 |
| `10109` | AMO ventilation colour -standard | `2` (PVC) | `—` | — | 10109 |
| `10110` | AERECO ventilation colour -standard | `2` (PVC) | `—` | — | 10110 |
| `10111` | Colour Ventilationów VENTEC standard | `2` (PVC) | `—` | — | 10111 |
| `10112` | Colour okapów under the roller shutter for ventilation AMO | `2` (PVC) | `—` | — | 10112 |
| `10113` | Colour Ventilationów VENTAIR standard | `2` (PVC) | `—` | — | 10113 |
| `10114` | BROOKVENT 1 ventilation colour -standard | `2` (PVC) | `—` | — | 10114 |
| `10115` | BROOKVENT 2 ventilation colour -non-standard | `2` (PVC) | `—` | — | 10115 |
| `10116` | BROOKVENT 4 ventilation colour -standard | `2` (PVC) | `—` | — | 10116 |
| `10117` | Colour Ventilationów BROOKVENT 4 standard | `2` (PVC) | `—` | — | 10117 |
| `10118` | Colour Ventilationów ZUROH | `2` (PVC) | `—` | — | 10118 |
| `10120` | Colour osłonek - Palette podstawowa | `2` (PVC) | `—` | — | 10120 |
| `10121` | Colour osłonek - Palette turnidthzona | `2` (PVC) | `—` | — | 10121 |
| `10122` | Colour osłonek - hingey budowlane | `2` (PVC) | `—` | — | 10122 |
| `10123` | Colour pochwycików | `2` (PVC) | `—` | — | 10123 |
| `10124` | Colour osłonek - PSK (PVC) | `2` (PVC) | `—` | — | 10124 |
| `10125` | Colour hingeów EXT | `2` (PVC) | `—` | — | 10125 |
| `10126` | Colour osłonek - PSK (ALU) | `2` (PVC) | `—` | — | 10126 |
| `10127` | Kolory osłonek ROTO | `2` (PVC) | `—` | — | 10127 |
| `10128` | Kolory osłonek kształt KOŁO - zawiasy HAUTAU | `2` (PVC) | `—` | — | 10128 |
| `10129` | AMO ventilation colour -non-standard | `2` (PVC) | `—` | — | 10130 |
| `10130` | AERECO ventilation colour -non-standard | `2` (PVC) | `—` | — | 10130 |
| `10131` | Colour Ventilationów VENTEC non-standard | `2` (PVC) | `—` | — | 10131 |
| `10133` | Colour Ventilationów VENTAIR non-standard | `2` (PVC) | `—` | — | 10133 |
| `10134` | BROOKVENT 1 ventilation colour -non-standard | `2` (PVC) | `—` | — | 10134 |
| `10135` | BROOKVENT 2 ventilation colour -standard | `2` (PVC) | `—` | — | 10135 |
| `10136` | BROOKVENT 3 ventilation colour -non-standard | `2` (PVC) | `—` | — | 10136 |
| `10137` | BROOKVENT 4 ventilation colour -non-standard | `2` (PVC) | `—` | — | 10137 |
| `10138` | Kolory nawiewników SLIMLINE 2000 | `2` (PVC) | `—` | — | 10138 |
| `10211` | Packagey do wypełnień 36mm PVC | `2` (PVC) | `—` | — | 10200 |
| `10212` | Packagey do wypełnień 36mm ALU | `2` (PVC) | `—` | — | 10200 |
| `10213` | Packagey do wypełnień 77mm ALU | `2` (PVC) | `—` | — | 10200 |
| `10214` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `2` (PVC) | `—` | — | 10200 |
| `10215` | Pakiety do wypełnień 24mm PVC | `2` (PVC) | `—` | — | 10200 |
| `10216` | Pakiety do wypełnień 48mm PVC | `2` (PVC) | `—` | — | 10200 |
| `10217` | Pakiety do wypełnień 23mm ALU | `2` (PVC) | `—` | — | 10200 |
| `10218` | Pakiety do wypełnień 35mm ALU | `2` (PVC) | `—` | — | 10200 |
| `10219` | Pakiety do wypełnień 47mm ALU | `2` (PVC) | `—` | — | 10200 |
| `10220` | Pakiety do wypełnień 77mm ALU do panelu CLASSIC3 | `2` (PVC) | `—` | — | 10200 |
| `10221` | Colour pull handle ów M2 for PVC | `2` (PVC) | `—` | — | 10200 |
| `10222` | Colour pull handle ów M2 to ALU | `2` (PVC) | `—` | — | 10200 |
| `10226` | Pakiety do wypełnień 77mm ALU do panelu MODERN_15_C | `2` (PVC) | `—` | — | 10200 |
| `10208` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Lacobel | `2` (PVC) | `—` | — | 10208 |
| `10209` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `2` (PVC) | `—` | — | 10209 |
| `10210` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą Milk2Line | `2` (PVC) | `—` | — | 10210 |
| `10225` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą LacobelLin | `2` (PVC) | `—` | — | 10210 |
| `10223` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `2` (PVC) | `—` | — | 10223 |
| `10224` | Pakiety do wypełnień 77mm ALU dost. tylko z szybą BLACKLINE | `2` (PVC) | `—` | — | 10223 |
| `10250` | Pakiety do wypełnień 24mm DRUTEX_C | `2` (PVC) | `—` | — | 10250 |
| `10251` | Pakiety do wypełnień 36mm DRUTEX_C | `2` (PVC) | `—` | — | 10251 |
| `10252` | Pakiety do wypełnień 48mm DRUTEX_C | `2` (PVC) | `—` | — | 10252 |
| `10260` | Pakiety do wypełnień 28mm DRUTEX_DRE | `2` (PVC) | `—` | — | 10260 |
| `10261` | Pakiety do wypełnień 40mm DRUTEX_DRE | `2` (PVC) | `—` | — | 10261 |
| `10262` | Pakiety do wypełnień 48mm DRUTEX_DRE | `2` (PVC) | `—` | — | 10262 |
| `10290` | Ramki międzyszybowe do paneli drutex | `2` (PVC) | `—` | — | 10290 |
| `10291` | Ramki międzyszybowe do paneli VPTrend | `2` (PVC) | `—` | — | 10291 |
| `10300` | Color Self-closer Geze TS2000 | `2` (PVC) | `—` | — | 10300 |
| `10301` | Color Self-closer Geze TS4000 | `2` (PVC) | `—` | — | 10300 |
| `10302` | Color Self-closer DORMA TS PROFIL | `2` (PVC) | `—` | — | 10302 |
| `10303` | DORMA TS 93 self-closer colour | `2` (PVC) | `—` | — | 10303 |
| `10304` | Color Self-closer Geze TS5000 | `2` (PVC) | `—` | — | 10304 |
| `10600` | DZ- handle OUTSIDE | `2` (PVC) | `—` | — | 10600 |
| `10603` | DZ- handle H6S26 OUTSIDE | `3` (Aluminium) | `—` | — | 10600 |
| `10650` | Kolory ramki przyszybowej paneli | `2` (PVC) | `—` | — | 10600 |
| `10601` | TZ- handle tarasowe OUTSIDE | `2` (PVC) | `—` | — | 10601 |
| `10602` | DZ - Rozety OUTSIDE | `2` (PVC) | `—` | — | 10602 |
| `10632` | DZ - Rozety zewnątrz ALU | `2` (PVC) | `—` | — | 10602 |
| `10605` | DZ- pull handle y | `2` (PVC) | `—` | — | 10605 |
| `10610` | DZ - handle Inside | `2` (PVC) | `—` | — | 10610 |
| `10612` | DZ - Rozety Inside | `2` (PVC) | `—` | — | 10612 |
| `10642` | DZ - Rozety wewnątrz ALU | `2` (PVC) | `—` | — | 10612 |
| `10613` | DZ - handle H6S26 Inside | `3` (Aluminium) | `—` | — | 10613 |
| `10615` | DZ - hingey doorowe | `2` (PVC) | `—` | — | 10615 |
| `10617` | DZ - hingey doorowe ALU | `3` (Aluminium) | `—` | — | 10615 |
| `10618` | DZ - Door plate  Type 33 PZ BLACK anode | `3` (Aluminium) | `—` | — | 10615 |
| `10616` | DZ - hingey doorowe DRE | `1` (Wood / System) | `—` | — | 10616 |
| `10619` | DZ - Zawiasy drzwiowe JOCKER / Rolkowe | `2` (PVC) | `—` | — | 10619 |
| `10620` | DZ - Rozety SATURN | `2` (PVC) | `—` | — | 10620 |
| `10621` | DZ - Zawiasy drzwiowe DR.HAHN | `2` (PVC) | `—` | — | 10621 |
| `10622` | DZ - Zawiasy drzwiowe DR.HAHN (ale nie w NL7000) | `2` (PVC) | `—` | — | 10622 |
| `10702` | Glazing beads PVC | `2` (PVC) | `—` | — | 10702 |
| `10703` | Listwy przyszybowe PVC - Aluplast | `2` (PVC) | `—` | — | 10703 |
| `10711` | Glazing beads wood | `1` (Wood / System) | `—` | — | 10711 |
| `10712` | Glazing beads WOOD 78 | `1` (Wood / System) | `—` | — | 10711 |
| `10713` | Glazing beads WOOD 88 | `1` (Wood / System) | `—` | — | 10711 |
| `10715` | Listwy przyszybowe DUOLINE 68 | `1` (Wood / System) | `—` | — | 10711 |
| `10716` | Listwy przyszybowe DUOLINE 78 | `1` (Wood / System) | `—` | — | 10711 |
| `10717` | Listwy przyszybowe DUOLINE 88 | `1` (Wood / System) | `—` | — | 10711 |
| `10720` | Glazing beads/profile dodatkowe ALU | `3` (Aluminium) | `—` | — | 10711 |
| `10802` | stick-on grills VEKA | `2` (PVC) | `—` | — | 10802 |
| `10902` | Silly VEKA | `2` (PVC) | `—` | — | 10902 |
| `10905` | Silly aluminiowe | `2` (PVC) | `—` | — | 10905 |
| `10911` | Silly Drewniane | `1` (Wood / System) | `—` | — | 10911 |
| `11022` | ALU - Colour zaslepek odwodnien | `3` (Aluminium) | `—` | — | 11022 |
| `11023` | ALU - Kolory zaslepek odwodnien - Cor Vision Plus | `3` (Aluminium) | `—` | — | 11022 |
| `11050` | ALU - HS pull handle color | `3` (Aluminium) | `—` | — | 11050 |
| `11121` | Colour osłonek - Palette turnidthzona | `3` (Aluminium) | `—` | — | 11121 |
| `11250` | Color of ventilation sleeves for ALU | `3` (Aluminium) | `—` | — | 11250 |
| `15001` | Wzory piaskowań | `2` (PVC) | `—` | — | 15001 |
| `15010` | Wypełnienia Drutex PVC | `2` (PVC) | `—` | — | 15010 |
| `15016` | Wypełnienia DRUTEX DRE (3D_WOOD_1) | `2` (PVC) | `—` | — | 15010 |
| `15020` | PŁyty sandwich PVC | `2` (PVC) | `—` | — | 15010 |
| `15021` | PŁyty sandwich ALU | `2` (PVC) | `—` | — | 15010 |
| `15022` | PŁyty sandwich PVC | `2` (PVC) | `—` | — | 15010 |
| `15024` | Wypełnienia DRUTEX DRE (bez 3D_WOOD_1) | `2` (PVC) | `—` | — | 15010 |
| `15100` | Wypełnienia DRUTEX PVC - grubość wypełnienia 36,48 | `2` (PVC) | `—` | — | 15010 |
| `15011` | Wypełnienia Drutex ALU | `2` (PVC) | `—` | — | 15011 |
| `15012` | Wypełnienia Drutex ALU only Cap | `2` (PVC) | `—` | — | 15012 |
| `15013` | KN infills | `2` (PVC) | `—` | — | 15013 |
| `15014` | Wypełnienia DRUTEX L (LAMELE) | `2` (PVC) | `—` | — | 15014 |
| `15025` | Wypełnienia DRUTEX ALU ADEK-ADEK/ADEK-ARAL | `3` (Aluminium) | `—` | — | 15025 |
| `15026` | Wypełnienia DRUTEX ALU BEZ(ADEK-ADEK/ADEK-ARAL) | `3` (Aluminium) | `—` | — | 15026 |
| `16000` | Colour akcesorii do ecosol70 | `2` (PVC) | `—` | — | 16000 |
| `19000` | =====WOODWORK======== | `1` (Wood / System) | `—` | — | 19000 |
| `19010` | Colour Drip capów alu Gutmann | `1` (Wood / System) | `—` | — | 19010 |
| `19011` | Sandwich panel / boazeryjne DRE | `1` (Wood / System) | `—` | — | 19011 |
| `19012` | Panele sandwich / boazeryjne DRA | `1` (Wood / System) | `—` | — | 19011 |
| `19020` | Colour Siliconeu | `1` (Wood / System) | `—` | — | 19020 |
| `19600` | DZ- handle OUTSIDE | `1` (Wood / System) | `—` | — | 19600 |
| `19602` | DZ - Rozety OUTSIDE | `1` (Wood / System) | `—` | — | 19602 |
| `19610` | DZ - handle Inside | `1` (Wood / System) | `—` | — | 19610 |
| `19612` | DZ - Rozety Inside | `1` (Wood / System) | `—` | — | 19612 |
| `19615` | DZ - hingey doorowe | `2` (PVC) | `—` | — | 19615 |

---
_Generated by `scripts/queryProductLines.mjs`_
