const puppeteer = require("puppeteer");
var URL = "";
async function clickBtn(page) {
  for (var i = 0; i < 50; i++) {
    var bool = await page.evaluate(() => {
      const element = document.querySelector("#load_more_button"); // Replace with the actual selector
      if (element) {
        element.click();
      }
      return element;
    });
    console.log("bool-->", bool);
  }
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 600;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 600);
    });
  });
}
async function scrollPage(page) {
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
}
async function scrollToSpecific(page) {
  const scrollTimes = 600; // Adjust the number of times you want to scroll
  for (let i = 0; i < scrollTimes; i++) {
    await scrollPage(page);
    await page.waitForTimeout(50); // Adjust the timeout as needed to allow content to load
  }
}
var express = require("express");
var app = express();
var cors = require("cors");

app.use(cors());
app.use(express.json());

app.post("/page", async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const browser = await puppeteer.launch();
    let url = req.body.url;
    const page = await browser.newPage();
    await page.goto(url);

    await autoScroll(page);
    // await scrollToSpecific(page);
    if (url.includes("www.makaan.com")) {
      await autoScroll(page);
      const data = await page.evaluate(() => {
        const scriptElements = document.querySelectorAll("script");
        // const scriptData = [];
        const mainData = [];
        scriptElements.forEach((script) => {
          const scriptContent = script.textContent;
          // scriptData.push(scriptContent);
          try {
            const jsonData = JSON.parse(scriptContent);
            var objTemp = {
              Name: "",
              Price: jsonData.price,
              Size: jsonData.size,
              Status: jsonData.projectStatus,
              image: jsonData.imageUrl,
              Address: jsonData.localityName,
            };
            if (jsonData.bedrooms == "") {
              objTemp.Name = jsonData.propertyType;
            } else {
              objTemp.Name =
                jsonData.bedrooms + " BHK " + jsonData.propertyType;
            }
            if (
              objTemp.Name != undefined &&
              objTemp.Price != undefined &&
              objTemp.Status != undefined &&
              objTemp.image != undefined &&
              objTemp.Address != undefined
            )
              mainData.push(objTemp);
            // scriptData.push(jsonData);
          } catch (error) {}
        });
        return mainData;
      });
      // console.log("Data-->", data);
      const pagination = await page.evaluate(() => {
        var tempList = [];
        document.querySelectorAll(".pagination").forEach((ele) => {
          ele.querySelectorAll("li").forEach((elee) => {
            tempList.push(elee.textContent);
          });
        });
        return tempList;
      });
      res.send({ data, pagination });
    } else if (url.includes("https://housing.com")) {
      const data = await page.evaluate(() => {
        const articleElements = document.querySelectorAll("article");
        const scriptData = [];

        const data = articleElements.forEach((script) => {
          let image = script.querySelector("img")?.src;
          let Price = script.querySelector(".css-18rodr0")?.textContent;
          let Name = script.querySelector("._ks15vq")?.textContent;
          let EMI = script.querySelector(".css-nin1gj")?.textContent;
          let Location = script.querySelector("._18uq1994")?.textContent;
          let Area = script.querySelector(".css-4z3njv")?.textContent;
          // let Description =
          //   script.querySelector(" .description-text")?.textContent;

          scriptData.push({
            image: image,
            Price: Price,
            Name: Name,
            EMI: EMI,
            Location: Location,
            Area: Area,
            // Description: Description,
          });
        });
        return scriptData;
      });
      res.send(data);
    } else if (url.includes("https://www.quikr.com")) {
      const data = await page.evaluate(() => {
        var list = [];
        const divElements = document.querySelectorAll(".listing-tile-wrap");
        divElements.forEach((divElement) => {
          var Price = divElement.querySelector(".liprice").textContent;
          Price = Price.replace(/(\r\n\t|\n|\r|\t)/gm, "");
          Price = Price.trim();

          var Name = divElement.querySelector(".listtitle").textContent;

          const discriptionList = divElement.querySelectorAll("li");
          var tempObj = [];
          discriptionList.forEach((liEle) => {
            var temp = liEle.textContent;
            temp = temp.replace(/(\r\n\t|\n|\r|\t)/gm, "");
            temp = temp.trim();
            temp = temp.replace(/\s+/g, " ").trim();
            var field = temp.substring(0, temp.indexOf(" "));
            var value = temp.substring(temp.indexOf(" "), temp.length);
            tempObj.push({ [field]: value });
          });

          var imageUrl = divElement.querySelector("img").src;
          var Specification = [];
          divElement.querySelectorAll(".listspecs span").forEach((ele) => {
            Specification.push(ele.textContent);
          });
          list.push({
            Name: Name,
            Price: Price,
            Description: tempObj,
            image: imageUrl,
            Specification: Specification,
            // Area:tempObj[1].Built-Up
          });
        });
        return list;
      });

      res.send(data);
    } else if (url.includes("https://www.squareyards.com")) {
      await page.waitForSelector(".img-responsive", { visible: true });
      const data = await page.evaluate(() => {
        var list = [];
        const divElements = document.querySelectorAll(".dseprojectdata");
        divElements.forEach((divElement) => {
          var Price = divElement.querySelector(".tlPrc").textContent;
          Price = Price.replace(/(\r\n\t|\n|\r|\t)/gm, "");
          Price = Price.trim();
          var Location = divElement.querySelector(".tlHdng  ").innerHTML;
          var Name = divElement.querySelector(".tileProjectName").textContent;

          var imageUrl = divElement.querySelector("img").src;

          var Size = divElement.querySelector(".tlSqFt").textContent;

          // var other=divElement.querySelector('.DSE_Resale_D18').textContent;
          // other = other.replace(/(\r\n\t|\n|\r|\t)/gm, "");
          // other = other.trim();

          var discription;
          divElement
            .querySelectorAll(".tlDscDescription div")
            .forEach((ele) => {
              discription = ele.textContent;
            });
          list.push({
            Name: Name,
            Price: Price,
            image: imageUrl,
            Area: Size,
            Description: discription,
            Location: Location,
          });
        });
        return list;
      });
      console.log("My Data=>", data);
      res.send(data);
    } else if (url.includes("realestateindia.com")) {
      await autoScroll(page);
      await clickBtn(page);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await autoScroll(page);
      const data = await page.evaluate(() => {
        var list = [];
        const divElements = document.querySelectorAll(".ps-list");
        divElements.forEach((divElement) => {
          var Price = divElement.querySelector(".fr").textContent;
          Price = Price.replace(/(\r\n\t|\n|\r|\t)/gm, "");
          Price = Price.trim();

          var Name = divElement.querySelector(".fw4").textContent;

          const discriptionList = divElement.querySelectorAll("li");
          var tempObj = [];
          discriptionList.forEach((liEle) => {
            var temp = liEle.textContent;
            temp = temp.replace(/(\r\n\t|\n|\r|\t)/gm, "");
            if (temp.includes("Location") || temp.includes("Built"))
              tempObj.push(temp);
          });
          var object = [];
          try {
            if (tempObj[0].includes("Built"))
              object.push({
                [tempObj[0].substring(0, 13)]: tempObj[0].substring(
                  13,
                  tempObj[0].length
                ),
              });
            if (tempObj[1].includes("Location"))
              object.push({
                [tempObj[1].substring(0, 8)]: tempObj[1].substring(
                  8,
                  tempObj[0].length
                ),
              });
          } catch (e) {}
          // var other= divElement.querySelector(".mr20px").textContent;
          // other = other.replace(/(\r\n\t|\n|\r|\t)/gm, "");

          var Size = divElement.querySelector(".sc").textContent;
          var imgList = [];

          var imageUrl = divElement.querySelector("img").src;
          // imgList.push(ele.src);
          // });

          list.push({
            Name: Name,
            Price: Price,
            Description: object,
            image: imageUrl,
            Size: Size,
            // other:other
            // Specification: Specification,
            // Area:tempObj[1].Built-Up
          });
        });
        return list;
      });
      console.log(JSON.stringify(data));
      res.send(data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
});

const port = process.env.PORt || 4000;
app.listen(port, () => {
  console.log(`listen on PORT ${port}`);
});
