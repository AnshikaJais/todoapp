const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config({ path: "./config.env" });
const { TodoList, List } = require("./models/todolist");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Connecting to Database
const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
).replace("<DATABASE_NAME>", "todolistDB");

mongoose.connect(DB, { useNewUrlParser: true }).then(() => {
    console.log("Connected Successfully to Database.");
});

const defaultValues1 = new TodoList({
    workName: "Welcome to Todo List!",
});
const defaultValues2 = new TodoList({
    workName: "Hit '+' button to add the work",
});
const defaultValues3 = new TodoList({
    workName: "<-- Hit this checkbox to delete the work",
});

app.get("/", async (req, res) => {
    await TodoList.find().then((docs) => {
        if (docs.length === 0) {
            TodoList.create([
                defaultValues1,
                defaultValues2,
                defaultValues3,
            ]).then((docs) => {
                res.redirect("/");
            });
        } else {
            res.render("list", { listTitle: "Today", listItems: docs });
        }
    });
});

app.get("/:custListName", async (req, res) => {
    const custName = _.capitalize(req.params.custListName);
    if (custName !== "Today" && custName !== "Favicon.ico") {
        await List.findOne({ name: custName }).then((docs) => {
            if (docs === null) {
                const newItem = new List({
                    name: custName,
                    work: [defaultValues1, defaultValues2, defaultValues3],
                });
                newItem.save().then((docs) => {
                    res.redirect(`/${custName}`);
                });
            } else {
                res.render("list", {
                    listTitle: custName,
                    listItems: docs.work,
                });
            }
        });
    } else {
        res.redirect("/");
    }
});

app.post("/", async (req, res) => {
    const newWork = req.body.newWork; // from input tag
    const listName = req.body.list; // from button tag
    if (newWork) {
        const newItem = new TodoList({
            workName: newWork,
        });
        if (listName === "Today") {
            newItem.save().then(() => {
                res.redirect("/");
            });
        } else if (listName !== "Favicon.ico") {
            await List.findOne({ name: listName })
                .then((docs) => {
                    if (docs) {
                        docs.work.push(newItem);
                        docs.save();
                        res.redirect(`/${listName}`);
                    }
                })
                .catch((err) => res.redirect(`/${listName}`));
        }
    } else {
        res.redirect("/");
    }
});

app.post("/delete", async (req, res) => {
    const itemId = req.body.deleteWork;
    const listName = req.body.listName;
    if (listName === "Today") {
        await TodoList.deleteOne({ _id: itemId }).then((docs) => {
            if (docs) {
                console.log(docs);
                res.redirect("/");
            }
        });
    } else {
        await List.findOneAndUpdate(
            { name: listName },
            {
                $pull: {
                    work: { _id: itemId },
                },
            }
        ).then((docs) => {
            res.redirect(`/${listName}`);
        });
    }
});

app.get("*", (req, res, next) => {
    console.log(req.url);
    next();
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, "127.0.0.1", () => {
    console.log("Sever started on port 3000");
});
