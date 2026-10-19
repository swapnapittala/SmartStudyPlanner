// ========================================
// SHOW SECTION
// ========================================



async function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");

    sections.forEach(function(section) {
        section.classList.add("hidden");
    });

    const selectedSection = document.getElementById(sectionId);
    if (!selectedSection) return;

    selectedSection.classList.remove("hidden");

    if (sectionId === "dashboard") {
        await loadSubjects();
        await loadTasks();
        updateProgress();
    }

    if (sectionId === "subjects") {
        await loadSubjects();
    }

    if (sectionId === "tasks") {
        await loadSubjects();
        await loadTasks();
    }

    if (sectionId === "timetable") {
        await loadTimetable();
        await loadUnassignedTimetable();
    }

    if (sectionId === "quiz") {
        await loadSubjects();
        await loadQuizQuestions();
    }
}



// ========================================
// ADD SUBJECT
// ========================================

async function addSubject() {

    const input = document.getElementById("subjectInput");

    const subjectName = input.value.trim();

    if (subjectName === "") {

        alert("Please enter a subject name.");

        return;
    }

    try {

        const userId = localStorage.getItem("userId");

const response = await fetch(
    `http://127.0.0.1:8080/api/subjects?userId=${userId}`,
    {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: subjectName
            })

        });

        if (!response.ok) {

            throw new Error("Failed to add subject");

        }

        const savedSubject = await response.json();

        const list = document.getElementById("subjectList");

        const item = document.createElement("li");

        item.dataset.id = savedSubject.id;

        item.innerHTML = `
            ${savedSubject.name}

            <button onclick="deleteSubject(this)">
                🗑️ Delete
            </button>
        `;

        list.appendChild(item);

        input.value = "";

        updateSubjectCount();

        alert("Subject saved successfully!");

    } catch (error) {

        console.error(error);

        alert("Could not connect to backend.");

    }
}


// ========================================
// DELETE SUBJECT
// ========================================


async function deleteSubject(button) {
    const item = button.parentElement;
    const subjectId = item.dataset.id;
    const userId = localStorage.getItem("userId");

    if (!confirm("Are you sure you want to delete this subject?")) {
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/subjects/${subjectId}?userId=${userId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete subject");
        }

        await loadSubjects();

    } catch (error) {
        console.error(error);
        alert("Could not delete subject. Please try again.");
    }
}

// ========================================
// UPDATE SUBJECT COUNT
// ========================================


function updateSubjectCount() {
    const subjects = document.querySelectorAll("#subjectList li");
    const countElement = document.getElementById("subjectCount");

    if (countElement) {
        countElement.innerText = subjects.length + " Subjects";
    }

    updateProgress();
}

// ========================================
// ADD TASK
// ========================================

async function addTask() {

    const taskInput =
        document.getElementById("taskInput");

    const taskSubject =
        document.getElementById("taskSubject");

    const taskName =
        taskInput.value.trim();

    const subjectName =
        taskSubject.value.trim();

    if (taskName === "" || subjectName === "") {

        alert("Please enter both task and subject.");

        return;
    }

    try {

        
const userId = localStorage.getItem("userId");

const response = await fetch(
    `http://127.0.0.1:8080/api/tasks?userId=${userId}`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: taskName,
            subject: subjectName
        })
    }
);


        if (!response.ok) {

            throw new Error("Failed to save task");

        }

        const savedTask = await response.json();

        const taskList =
            document.getElementById("taskList");

        const task =
            document.createElement("div");

        task.className = "task";

        task.dataset.id = savedTask.id;

        task.innerHTML = `
            <div>

                <strong>${savedTask.name}</strong>

                <br>

                <small>
                    Subject: ${savedTask.subject}
                </small>

            </div>

            <div>

                <button onclick="completeTask(this)">
                    ✅ Complete
                </button>

                <button onclick="deleteTask(this)">
                    🗑️ Delete
                </button>

            </div>
        `;

        taskList.appendChild(task);

        taskInput.value = "";

        taskSubject.value = "";

        updateTaskCount();
        updateProgress();

    } catch (error) {

        console.error(error);

        alert("Could not connect to backend.");

    }
}


// ========================================
// COMPLETE TASK
// ========================================



async function completeTask(button) {
    const item = button.closest(".task");
    const taskId = item.dataset.id;
    const userId = localStorage.getItem("userId");

    const isCompleted = item.classList.contains("completed");

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/tasks/${taskId}/complete?userId=${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completed: !isCompleted
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        await loadTasks();

    } catch (error) {
        console.error(error);
        alert("Could not update task.");
    }
}



// ========================================
// DELETE TASK
// ========================================


async function deleteTask(button) {
    const item = button.closest(".task");
    const taskId = item.dataset.id;
    const userId = localStorage.getItem("userId");

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/tasks/${taskId}?userId=${userId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        await loadTasks();

    } catch (error) {
        console.error(error);
        alert("Could not delete task.");
    }
}

function updateTaskCount() {
    const tasks = document.querySelectorAll("#taskList .task");
    const countElement = document.getElementById("taskCount");

    if (countElement) {
        countElement.innerText = tasks.length + " Tasks";
    }
}


// ========================================
// UPDATE PROGRESS
// ========================================


function updateProgress() {
    const subjects = document.querySelectorAll("#subjectList li");
    const tasks = document.querySelectorAll("#taskList .task");
    const taskList = document.getElementById("taskList");
    const completedTasks = document.querySelectorAll(
        "#taskList .task.completed"
    );

    const progress = tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    // Update dashboard numbers safely
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = value;
        }
    };

    setText("progressSubjects", subjects.length);
    setText("progressTasks", tasks.length);
    setText("completedTasks", completedTasks.length);
    setText("progressCount", progress + "%");
    setText("taskProgress", progress + "%");
    setText("progressText", progress + "% completed");

    // Update progress bar
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.style.width = progress + "%";
    }
}


// ========================================
// ADD TIMETABLE
// ========================================

async function addTimetable() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        return;
    }

    const day = document.getElementById("day").value;
    const subject = document.getElementById("timetableSubject").value.trim();
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const topic = document.getElementById("topic").value.trim();

    if (!day || !subject || !startTime || !endTime || !topic) {
        alert("Please fill all timetable details.");
        return;
    }

    if (startTime >= endTime) {
        alert("End time must be after start time.");
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/timetable?userId=${encodeURIComponent(userId)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    day: day,
                    subject: subject,
                    startTime: startTime,
                    endTime: endTime,
                    topic: topic
                })
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        alert("Timetable saved successfully!");

        document.getElementById("day").value = "";
        document.getElementById("timetableSubject").value = "";
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        document.getElementById("topic").value = "";

        await loadTimetable();

    } catch (error) {
        console.error("Error saving timetable:", error);
        alert("Could not save timetable. Check the browser console.");
    }
}


async function deleteTimetable(button) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        return;
    }

    const entry = button.closest(".timetable-entry");
    const timetableId = entry?.dataset.id;

    if (!timetableId) {
        alert("Could not find this timetable entry.");
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/timetable/${timetableId}?userId=${encodeURIComponent(userId)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        await loadTimetable();

        alert("Timetable deleted successfully!");

    } catch (error) {
        console.error("Error deleting timetable:", error);
        alert("Could not delete timetable. Check the browser console.");
    }
}


// ========================================
// QUIZ
// ========================================
const builtInQuizQuestions = [
    // C
    { subject: "C", question: "Which function is the usual entry point of a C program?", options: ["start()", "main()", "run()", "init()"], answer: "main()" },
    { subject: "C", question: "Which format specifier is commonly used for int in printf?", options: ["%c", "%f", "%d", "%s"], answer: "%d" },
    {
    subject: "C",
    question: "Which symbol ends a statement in C?",
    options: [".", ";", ":", ","],
    answer: ";"
},
{
    subject: "C",
    question: "Which function displays output in C?",
    options: ["input()", "print()", "printf()", "display()"],
    answer: "printf()"
},
{
    subject: "C",
    question: "Which header file declares printf()?",
    options: ["<stdlib.h>", "<string.h>", "<stdio.h>", "<math.h>"],
    answer: "<stdio.h>"
},
{
    subject: "C",
    question: "Which format specifier is commonly used for an int?",
    options: ["%c", "%d", "%f", "%s"],
    answer: "%d"
},
{
    subject: "C",
    question: "Which loop executes its body at least once?",
    options: ["for", "while", "do-while", "None of these"],
    answer: "do-while"
},
{
    subject: "C",
    question: "Which operator gives the remainder?",
    options: ["/", "*", "%", "//"],
    answer: "%"
},
{
    subject: "C",
    question: "Which keyword returns a value from a function?",
    options: ["break", "return", "continue", "exit"],
    answer: "return"
},
{
    subject: "C",
    question: "Which index refers to the first element of an array in C?",
    options: ["0", "1", "-1", "Depends on the array"],
    answer: "0"
},

    // C++
    { subject: "C++", question: "Which stream is commonly used for output?", options: ["cin", "cout", "print", "echo"], answer: "cout" },
    { subject: "C++", question: "Which concept allows functions with the same name but different parameters?", options: ["Overloading", "Inheritance", "Casting", "Compilation"], answer: "Overloading" },
    {
    subject: "C++",
    question: "Which symbol is used for the scope resolution operator?",
    options: [".", "->", "::", ":"],
    answer: "::"
},
{
    subject: "C++",
    question: "Which feature allows the same function name with different parameters?",
    options: ["Overriding", "Overloading", "Inheritance", "Encapsulation"],
    answer: "Overloading"
},
{
    subject: "C++",
    question: "Which keyword creates an object dynamically?",
    options: ["create", "malloc", "new", "object"],
    answer: "new"
},
{
    subject: "C++",
    question: "Which access specifier allows access from anywhere?",
    options: ["private", "protected", "public", "internal"],
    answer: "public"
},
{
    subject: "C++",
    question: "Which operator accesses a member through a pointer?",
    options: [".", "->", "::", "&"],
    answer: "->"
},
{
    subject: "C++",
    question: "Which concept lets a derived class reuse a base class?",
    options: ["Polymorphism", "Inheritance", "Abstraction", "Compilation"],
    answer: "Inheritance"
},
{
    subject: "C++",
    question: "Which stream is commonly used for console output?",
    options: ["cin", "cout", "cerrin", "input"],
    answer: "cout"
},
{
    subject: "C++",
    question: "Which function has the same name as its class and initializes objects?",
    options: ["Destructor", "Main function", "Constructor", "Operator function"],
    answer: "Constructor"
},

    // Java
    { subject: "Java", question: "Which keyword declares a class?", options: ["function", "class", "define", "newclass"], answer: "class" },
    { subject: "Java", question: "Which type stores true or false?", options: ["int", "String", "boolean", "char"], answer: "boolean" },
    {
    subject: "Java",
    question: "Which keyword is used to inherit a class in Java?",
    options: ["implements", "extends", "inherits", "super"],
    answer: "extends"
},
{
    subject: "Java",
    question: "Which method is the entry point of a Java program?",
    options: ["start()", "run()", "main()", "init()"],
    answer: "main()"
},
{
    subject: "Java",
    question: "Which data type stores true or false?",
    options: ["int", "char", "boolean", "String"],
    answer: "boolean"
},
{
    subject: "Java",
    question: "Which operator checks equality of primitive values?",
    options: ["=", "==", "!=", "equals"],
    answer: "=="
},
{
    subject: "Java",
    question: "Which keyword creates an object?",
    options: ["class", "this", "new", "void"],
    answer: "new"
},
{
    subject: "Java",
    question: "Which collection stores unique elements?",
    options: ["ArrayList", "HashSet", "Array", "LinkedList"],
    answer: "HashSet"
},
{
    subject: "Java",
    question: "Which block handles an exception?",
    options: ["try", "catch", "final", "throw"],
    answer: "catch"
},
{
    subject: "Java",
    question: "Which keyword prevents a variable from being reassigned?",
    options: ["static", "const", "final", "private"],
    answer: "final"
},

    // Python
    { subject: "Python", question: "Which keyword defines a function?", options: ["func", "define", "def", "function"], answer: "def" },
    { subject: "Python", question: "What is len('cat')?", options: ["2", "3", "4", "5"], answer: "3" },
    {
    subject: "Python",
    question: "Which symbol starts a comment in Python?",
    options: ["//", "#", "/*", "<!--"],
    answer: "#"
},
{
    subject: "Python",
    question: "Which data type stores key-value pairs?",
    options: ["list", "tuple", "dict", "set"],
    answer: "dict"
},
{
    subject: "Python",
    question: "Which keyword defines a function?",
    options: ["function", "define", "def", "fun"],
    answer: "def"
},
{
    subject: "Python",
    question: "Which collection is immutable?",
    options: ["list", "set", "dictionary", "tuple"],
    answer: "tuple"
},
{
    subject: "Python",
    question: "What is the result of 10 // 3?",
    options: ["3.33", "3", "1", "4"],
    answer: "3"
},
{
    subject: "Python",
    question: "Which keyword is used for a loop over a sequence?",
    options: ["repeat", "foreach", "for", "loop"],
    answer: "for"
},
{
    subject: "Python",
    question: "Which function returns the length of a list?",
    options: ["size()", "count()", "len()", "length()"],
    answer: "len()"
},
{
    subject: "Python",
    question: "Which value represents the absence of a value?",
    options: ["null", "None", "undefined", "empty"],
    answer: "None"
},

    // JavaScript
    { subject: "JavaScript", question: "Which keyword declares a reassignable block-scoped variable?", options: ["const", "let", "fixed", "define"], answer: "let" },
    { subject: "JavaScript", question: "Which operator checks strict equality?", options: ["=", "==", "===", "!="], answer: "===" },
    {
    subject: "JavaScript",
    question: "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "let", "static", "final"],
    answer: "let"
},
{
    subject: "JavaScript",
    question: "Which method selects an element by its ID?",
    options: [
        "document.getElementById()",
        "document.getClass()",
        "document.selectId()",
        "document.findId()"
    ],
    answer: "document.getElementById()"
},
{
    subject: "JavaScript",
    question: "Which operator checks both value and type equality?",
    options: ["=", "==", "===", "!="],
    answer: "==="
},
{
    subject: "JavaScript",
    question: "Which method adds an item to the end of an array?",
    options: ["push()", "pop()", "shift()", "slice()"],
    answer: "push()"
},
{
    subject: "JavaScript",
    question: "Which keyword declares a function?",
    options: ["method", "function", "define", "func"],
    answer: "function"
},
{
    subject: "JavaScript",
    question: "Which event occurs when a user clicks an element?",
    options: ["onchange", "onload", "onclick", "onhover"],
    answer: "onclick"
},
{
    subject: "JavaScript",
    question: "Which value represents an intentionally empty or missing value?",
    options: ["true", "undefined", "NaN", "Infinity"],
    answer: "undefined"
},
{
    subject: "JavaScript",
    question: "Which method converts a JSON string into a JavaScript value?",
    options: [
        "JSON.stringify()",
        "JSON.parse()",
        "JSON.convert()",
        "JSON.decode()"
    ],
    answer: "JSON.parse()"
},

    // HTML
    { subject: "HTML", question: "What does HTML mainly define?", options: ["Webpage structure", "Database storage", "Network routing", "Operating systems"], answer: "Webpage structure" },
    { subject: "HTML", question: "Which tag creates a hyperlink?", options: ["<p>", "<a>", "<h1>", "<img>"], answer: "<a>" },
    {
    subject: "HTML",
    question: "What does HTML stand for?",
    options: [
        "Hyper Text Markup Language",
        "High Text Machine Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language"
    ],
    answer: "Hyper Text Markup Language"
},
{
    subject: "HTML",
    question: "Which tag creates a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: "<a>"
},
{
    subject: "HTML",
    question: "Which tag inserts an image?",
    options: ["<image>", "<picture>", "<img>", "<src>"],
    answer: "<img>"
},
{
    subject: "HTML",
    question: "Which tag creates an unordered list?",
    options: ["<ol>", "<li>", "<ul>", "<list>"],
    answer: "<ul>"
},
{
    subject: "HTML",
    question: "Which attribute provides alternative text for an image?",
    options: ["title", "alt", "src", "href"],
    answer: "alt"
},
{
    subject: "HTML",
    question: "Which tag defines the largest standard heading?",
    options: ["<h6>", "<head>", "<heading>", "<h1>"],
    answer: "<h1>"
},
{
    subject: "HTML",
    question: "Which tag creates a table row?",
    options: ["<td>", "<th>", "<tr>", "<table-row>"],
    answer: "<tr>"
},
{
    subject: "HTML",
    question: "Which attribute specifies the destination of a hyperlink?",
    options: ["src", "href", "alt", "target"],
    answer: "href"
},

    // CSS
    { subject: "CSS", question: "What is CSS mainly used for?", options: ["Styling webpages", "Writing SQL", "Compiling Java", "Storing data"], answer: "Styling webpages" },
    { subject: "CSS", question: "Which property changes text color?", options: ["font-style", "background", "color", "text-weight"], answer: "color" },
    {
    subject: "CSS",
    question: "What does CSS stand for?",
    options: [
        "Computer Style Sheets",
        "Cascading Style Sheets",
        "Creative Style System",
        "Colorful Style Sheets"
    ],
    answer: "Cascading Style Sheets"
},
{
    subject: "CSS",
    question: "Which symbol selects a class in CSS?",
    options: ["#", ".", "*", "&"],
    answer: "."
},
{
    subject: "CSS",
    question: "Which symbol selects an element by ID?",
    options: [".", "#", "@", ":"],
    answer: "#"
},
{
    subject: "CSS",
    question: "Which property changes text color?",
    options: ["font-style", "background", "color", "text-size"],
    answer: "color"
},
{
    subject: "CSS",
    question: "Which property adds space inside an element's border?",
    options: ["margin", "padding", "outline", "gap"],
    answer: "padding"
},
{
    subject: "CSS",
    question: "Which property adds space outside an element's border?",
    options: ["padding", "border-spacing", "margin", "inset"],
    answer: "margin"
},
{
    subject: "CSS",
    question: "Which value enables a Flexbox layout?",
    options: ["display: block", "display: flex", "position: flex", "layout: flex"],
    answer: "display: flex"
},
{
    subject: "CSS",
    question: "Which property controls the size of text?",
    options: ["font-size", "text-weight", "font-color", "text-style"],
    answer: "font-size"
},

    // SQL
    { subject: "SQL", question: "Which command retrieves data?", options: ["GET", "SELECT", "OPEN", "CREATE"], answer: "SELECT" },
    { subject: "SQL", question: "Which clause filters rows by a condition?", options: ["ORDER BY", "GROUP BY", "WHERE", "JOIN"], answer: "WHERE" },
    {
    subject: "SQL",
    question: "Which SQL command retrieves data from a table?",
    options: ["GET", "SELECT", "OPEN", "FETCH TABLE"],
    answer: "SELECT"
},
{
    subject: "SQL",
    question: "Which clause filters rows based on a condition?",
    options: ["ORDER BY", "GROUP BY", "WHERE", "JOIN"],
    answer: "WHERE"
},
{
    subject: "SQL",
    question: "Which command adds a new row to a table?",
    options: ["UPDATE", "INSERT INTO", "ALTER", "CREATE"],
    answer: "INSERT INTO"
},
{
    subject: "SQL",
    question: "Which command changes existing row values?",
    options: ["MODIFY", "CHANGE", "UPDATE", "REPLACE TABLE"],
    answer: "UPDATE"
},
{
    subject: "SQL",
    question: "Which function counts rows?",
    options: ["SUM()", "TOTAL()", "COUNT()", "NUMBER()"],
    answer: "COUNT()"
},
{
    subject: "SQL",
    question: "Which clause sorts query results?",
    options: ["SORT", "ORDER BY", "ARRANGE", "GROUP BY"],
    answer: "ORDER BY"
},
{
    subject: "SQL",
    question: "Which constraint uniquely identifies each row?",
    options: ["FOREIGN KEY", "NOT NULL", "PRIMARY KEY", "DEFAULT"],
    answer: "PRIMARY KEY"
},
{
    subject: "SQL",
    question: "Which command removes a table and its definition?",
    options: ["DELETE", "REMOVE", "DROP TABLE", "CLEAR"],
    answer: "DROP TABLE"
},

    // DBMS
    { subject: "DBMS", question: "What does a primary key do?", options: ["Uniquely identifies a row", "Sorts all rows", "Encrypts data", "Deletes tables"], answer: "Uniquely identifies a row" },
    { subject: "DBMS", question: "Which normal form removes partial dependency on a composite key?", options: ["1NF", "2NF", "3NF", "5NF"], answer: "2NF" },
    {
    subject: "DBMS",
    question: "What does DBMS stand for?",
    options: [
        "Database Management System",
        "Data Backup Management Service",
        "Digital Base Management System",
        "Database Monitoring Software"
    ],
    answer: "Database Management System"
},
{
    subject: "DBMS",
    question: "Who is known as the father of relational database theory?",
    options: [
        "James Gosling",
        "E. F. Codd",
        "Dennis Ritchie",
        "Charles Babbage"
    ],
    answer: "E. F. Codd"
},
{
    subject: "DBMS",
    question: "Which key uniquely identifies a row in a table?",
    options: ["Foreign key", "Primary key", "Candidate key", "Composite key"],
    answer: "Primary key"
},
{
    subject: "DBMS",
    question: "Which normal form removes partial dependency?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "2NF"
},
{
    subject: "DBMS",
    question: "Which property of a transaction means all operations succeed or none do?",
    options: ["Consistency", "Isolation", "Atomicity", "Durability"],
    answer: "Atomicity"
},
{
    subject: "DBMS",
    question: "Which SQL command removes selected rows from a table?",
    options: ["DROP", "DELETE", "ALTER", "CREATE"],
    answer: "DELETE"
},
{
    subject: "DBMS",
    question: "What is database normalization mainly used for?",
    options: [
        "Increasing data duplication",
        "Reducing redundancy and anomalies",
        "Making every column a primary key",
        "Removing all relationships"
    ],
    answer: "Reducing redundancy and anomalies"
},
{
    subject: "DBMS",
    question: "Which key references a key in another table?",
    options: ["Primary key", "Alternate key", "Foreign key", "Super key"],
    answer: "Foreign key"
},

    // PHP
    { subject: "PHP", question: "Which symbol is used before a PHP variable name?", options: ["#", "$", "@", "%"], answer: "$" },
    { subject: "PHP", question: "Which statement can output text in PHP?", options: ["echo", "cout", "printLineJava()", "console.write"], answer: "echo" },
    {
    subject: "PHP",
    question: "What does PHP stand for?",
    options: [
        "Personal Home Page",
        "PHP: Hypertext Preprocessor",
        "Private Hosting Protocol",
        "Program Handling Processor"
    ],
    answer: "PHP: Hypertext Preprocessor"
},
{
    subject: "PHP",
    question: "Which symbol begins a PHP variable name?",
    options: ["#", "$", "@", "&"],
    answer: "$"
},
{
    subject: "PHP",
    question: "Which tag starts a PHP code block?",
    options: ["<php>", "<?php", "<script>", "<code>"],
    answer: "<?php"
},
{
    subject: "PHP",
    question: "Which statement outputs text in PHP?",
    options: ["echo", "display", "printText", "writeLine"],
    answer: "echo"
},
{
    subject: "PHP",
    question: "Which operator concatenates strings in PHP?",
    options: ["+", ".", "&", "::"],
    answer: "."
},
{
    subject: "PHP",
    question: "Which function counts elements in an array?",
    options: ["length()", "size()", "count()", "total()"],
    answer: "count()"
},
{
    subject: "PHP",
    question: "Which superglobal contains data sent using the POST method?",
    options: ["$_GET", "$_POST", "$_SESSION", "$_SERVER"],
    answer: "$_POST"
},
{
    subject: "PHP",
    question: "Which keyword declares a class in PHP?",
    options: ["object", "struct", "class", "define"],
    answer: "class"
},

    // C#
    { subject: "C#", question: "Which keyword declares a class in C#?", options: ["class", "def", "define", "newclass"], answer: "class" },
    { subject: "C#", question: "Which method prints a line to the C# console?", options: ["Console.WriteLine()", "cout()", "echo()", "printLine()"], answer: "Console.WriteLine()" },
    {
    subject: "C#",
    question: "Which keyword declares a class in C#?",
    options: ["struct", "class", "object", "define"],
    answer: "class"
},
{
    subject: "C#",
    question: "Which method is commonly the entry point of a C# console application?",
    options: ["Start()", "Run()", "Main()", "Begin()"],
    answer: "Main()"
},
{
    subject: "C#",
    question: "Which type stores true or false?",
    options: ["int", "string", "bool", "char"],
    answer: "bool"
},
{
    subject: "C#",
    question: "Which keyword creates an object instance?",
    options: ["new", "make", "create", "this"],
    answer: "new"
},
{
    subject: "C#",
    question: "Which access modifier allows access from anywhere permitted by the containing type?",
    options: ["private", "protected", "public", "internal"],
    answer: "public"
},
{
    subject: "C#",
    question: "Which symbol terminates most C# statements?",
    options: [":", ";", ".", ","],
    answer: ";"
},
{
    subject: "C#",
    question: "Which collection stores key-value pairs?",
    options: ["List<T>", "Queue<T>", "Dictionary<TKey, TValue>", "Stack<T>"],
    answer: "Dictionary<TKey, TValue>"
},
{
    subject: "C#",
    question: "Which keyword handles exceptions?",
    options: ["catch", "check", "error", "handle"],
    answer: "catch"
},
    

    // Aptitude
    { subject: "Aptitude", question: "What is 20% of 150?", options: ["20", "25", "30", "35"], answer: "30" },
    { subject: "Aptitude", question: "What is the average of 4, 8, and 12?", options: ["6", "8", "10", "12"], answer: "8" },
    { subject: "Aptitude", question: "A product costs ₹200 and sells for ₹250. What is the profit?", options: ["₹25", "₹40", "₹50", "₹75"], answer: "₹50" },
    { subject: "Aptitude", question: "What is the next number: 2, 4, 8, 16, ...?", options: ["18", "24", "30", "32"], answer: "32" },
    { subject: "Aptitude", question: "If 5 pens cost ₹40, what does 1 pen cost?", options: ["₹5", "₹8", "₹10", "₹12"], answer: "₹8" },
    {
    subject: "Aptitude",
    question: "What is 20% of 150?",
    options: ["20", "25", "30", "35"],
    answer: "30"
},
{
    subject: "Aptitude",
    question: "If a product costs ₹500 and its price increases by 10%, what is the new price?",
    options: ["₹510", "₹525", "₹550", "₹600"],
    answer: "₹550"
},
{
    subject: "Aptitude",
    question: "What is the average of 10, 20, and 30?",
    options: ["15", "20", "25", "30"],
    answer: "20"
},
{
    subject: "Aptitude",
    question: "A car travels 120 km in 3 hours. What is its average speed?",
    options: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
    answer: "40 km/h"
},
{
    subject: "Aptitude",
    question: "If 5 pens cost ₹50, what is the cost of 8 pens at the same rate?",
    options: ["₹60", "₹70", "₹80", "₹100"],
    answer: "₹80"
},
{
    subject: "Aptitude",
    question: "What is the simple interest on ₹1,000 at 10% per year for 2 years?",
    options: ["₹100", "₹150", "₹200", "₹250"],
    answer: "₹200"
},
{
    subject: "Aptitude",
    question: "A number is divided in the ratio 2:3, and the total is 25. What is the smaller part?",
    options: ["5", "10", "15", "20"],
    answer: "10"
},
{
    subject: "Aptitude",
    question: "What is the next number in the sequence 2, 4, 8, 16, __?",
    options: ["18", "24", "30", "32"],
    answer: "32"
},

    // Reasoning
    { subject: "Reasoning", question: "Find the next number: 3, 6, 9, 12, ...", options: ["13", "14", "15", "18"], answer: "15" },
    { subject: "Reasoning", question: "If CAT is coded as DBU, how is DOG coded using the same rule?", options: ["EPH", "CNG", "EOG", "FPI"], answer: "EPH" },
    { subject: "Reasoning", question: "Ravi faces north and turns right. Which direction is he facing?", options: ["West", "South", "East", "North"], answer: "East" },
    { subject: "Reasoning", question: "Choose the odd one out.", options: ["Apple", "Mango", "Carrot", "Banana"], answer: "Carrot" },
    { subject: "Reasoning", question: "All roses are flowers. Which statement follows?", options: ["All flowers are roses", "All roses are flowers", "No roses are flowers", "All flowers are red"], answer: "All roses are flowers" },
    {
    subject: "Reasoning",
    question: "What comes next: 3, 6, 9, 12, __?",
    options: ["13", "14", "15", "18"],
    answer: "15"
},
{
    subject: "Reasoning",
    question: "Find the odd one out.",
    options: ["Apple", "Mango", "Carrot", "Banana"],
    answer: "Carrot"
},
{
    subject: "Reasoning",
    question: "If CAT is coded as DBU by shifting each letter one step forward, how is DOG coded?",
    options: ["EPH", "EOG", "DPH", "FPH"],
    answer: "EPH"
},
{
    subject: "Reasoning",
    question: "All roses are flowers. Which statement must be true?",
    options: [
        "All flowers are roses",
        "All roses are flowers",
        "No roses are flowers",
        "All plants are roses"
    ],
    answer: "All roses are flowers"
},
{
    subject: "Reasoning",
    question: "A person faces north and turns right. Which direction are they facing?",
    options: ["West", "South", "East", "North"],
    answer: "East"
},
{
    subject: "Reasoning",
    question: "Complete the analogy: Bird is to fly as fish is to __.",
    options: ["Run", "Swim", "Walk", "Jump"],
    answer: "Swim"
},
{
    subject: "Reasoning",
    question: "If today is Monday, what day will it be after 3 days?",
    options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    answer: "Thursday"
},
{
    subject: "Reasoning",
    question: "Find the missing number: 5, 10, 20, 40, __.",
    options: ["45", "60", "80", "100"],
    answer: "80"
},
];

let quizQuestions = [...builtInQuizQuestions];

let currentQuestion = 0;
let quizScore = 0;
let questionAnswered = {};
let selectedQuizAnswers = {};
let quizFinished = false;

function startQuiz() {
    const dropdown = document.getElementById("quizSubject");
    const subject = dropdown ? dropdown.value.trim() : "";

    if (!subject) {
        alert("Please select a subject.");
        return;
    }

    const normalize = value => String(value || "").trim().toLowerCase();

    activeQuizQuestions = quizQuestions.filter(q =>
        normalize(q.subject) === normalize(subject)
    );

    if (activeQuizQuestions.length === 0) {
        alert("No questions available for " + subject +
              ". Please add questions for this subject.");
        return;
    }

    currentQuestion = 0;
    quizScore = 0;
    questionAnswered = {};
    selectedQuizAnswers = {};
    quizFinished = false;

    const score = document.getElementById("quizScore");
    if (score) {
        score.innerText = "0 / " + activeQuizQuestions.length;
    }

    showQuestion();
}

function showQuestion() {
    if (
        !activeQuizQuestions.length ||
        currentQuestion < 0 ||
        currentQuestion >= activeQuizQuestions.length
    ) {
        return;
    }

    const q = activeQuizQuestions[currentQuestion];
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const resultElement = document.getElementById("quizResult");

    if (!questionElement || !optionsElement || !resultElement) {
        return;
    }

    questionElement.innerText =
        "Question " + (currentQuestion + 1) +
        " of " + activeQuizQuestions.length + ": " + q.question;

    optionsElement.innerHTML = "";

    if (questionAnswered[currentQuestion]) {
        resultElement.innerText =
            selectedQuizAnswers[currentQuestion] === q.answer
                ? "✅ Correct!"
                : "❌ Wrong! Correct answer: " + q.answer;
    } else {
        resultElement.innerText = "";
    }

    q.options.forEach(option => {
        const button = document.createElement("button");
        button.innerText = option;
        button.classList.add("quiz-option");

        if (questionAnswered[currentQuestion]) {
            button.disabled = true;

            if (option === q.answer) {
                button.style.backgroundColor = "green";
                button.style.color = "white";
            } else if (option === selectedQuizAnswers[currentQuestion]) {
                button.style.backgroundColor = "red";
                button.style.color = "white";
            }
        }

        button.onclick = () => checkAnswer(option);
        optionsElement.appendChild(button);
    });

    const previousButton =
        document.querySelector('button[onclick="previousQuestion()"]');

    if (previousButton) {
        previousButton.disabled = currentQuestion === 0;
    }

    const nextButton =
        document.querySelector('button[onclick="nextQuestion()"]');

    if (nextButton) {
        nextButton.innerText =
            currentQuestion === activeQuizQuestions.length - 1
                ? "Finish Quiz ✓"
                : "Next Question ➡️";
    }
}

function checkAnswer(selectedAnswer) {
    const q = activeQuizQuestions[currentQuestion];

    if (!q || questionAnswered[currentQuestion] || quizFinished) {
        return;
    }

    selectedQuizAnswers[currentQuestion] = selectedAnswer;
    questionAnswered[currentQuestion] = true;

    if (selectedAnswer === q.answer) {
        quizScore++;
    }

    const score = document.getElementById("quizScore");
    if (score) {
        score.innerText = quizScore + " / " + activeQuizQuestions.length;
    }

    showQuestion();
}

function nextQuestion() {
    if (!activeQuizQuestions.length || quizFinished) {
        return;
    }

    if (currentQuestion < activeQuizQuestions.length - 1) {
        currentQuestion++;
        showQuestion();
        return;
    }

    quizFinished = true;

    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const resultElement = document.getElementById("quizResult");

    if (questionElement) {
        questionElement.innerText = "Quiz Completed!";
    }

    if (optionsElement) {
        optionsElement.innerHTML = "";
    }

    if (resultElement) {
        resultElement.innerText =
            "Your score: " + quizScore +
            " / " + activeQuizQuestions.length;
    }

    const score = document.getElementById("quizScore");
    if (score) {
        score.innerText = quizScore + " / " + activeQuizQuestions.length;
    }
}

function previousQuestion() {
    if (
        !activeQuizQuestions.length ||
        currentQuestion <= 0 ||
        quizFinished
    ) {
        return;
    }

    currentQuestion--;
    showQuestion();
}
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}
async function addQuizQuestion() {
    const subject = document.getElementById("quizQuestionSubject").value;
    const question = document.getElementById("newQuestion").value.trim();
    const optionA = document.getElementById("optionA").value.trim();
    const optionB = document.getElementById("optionB").value.trim();
    const optionC = document.getElementById("optionC").value.trim();
    const optionD = document.getElementById("optionD").value.trim();
    const correctAnswer = document.getElementById("correctAnswer").value;

    // Check that all details are entered
    if (
        subject === "" ||
        question === "" ||
        optionA === "" ||
        optionB === "" ||
        optionC === "" ||
        optionD === "" ||
        correctAnswer === ""
    ) {
        alert("Please fill all question details and select a subject.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8080/api/quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject: subject,
                question: question,
                optionA: optionA,
                optionB: optionB,
                optionC: optionC,
                optionD: optionD,
                correctAnswer: correctAnswer
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save quiz question");
        }

        alert("Question saved successfully!");

        document.getElementById("newQuestion").value = "";
        document.getElementById("optionA").value = "";
        document.getElementById("optionB").value = "";
        document.getElementById("optionC").value = "";
        document.getElementById("optionD").value = "";
        document.getElementById("correctAnswer").value = "";

        // Reload saved questions
        quizQuestions = quizQuestions.filter(q => !q.id);
        await loadQuizQuestions();

    } catch (error) {
        console.error(error);
        alert("Could not save question. Please check the backend.");
    }
}


async function loadSubjects() {

    try {

        const userId = localStorage.getItem("userId");
const response = await fetch(
    `http://127.0.0.1:8080/api/subjects?userId=${userId}`
);
        if (!response.ok) {
            throw new Error("Failed to load subjects");
        }

        const subjects = await response.json();

        const list =
            document.getElementById("subjectList");

        list.innerHTML = "";

        subjects.forEach(subject => {

            const item =
                document.createElement("li");

            item.dataset.id = subject.id;

            item.innerHTML = `
                ${subject.name}
                <button onclick="deleteSubject(this)">
                    🗑️ Delete
                </button>
            `;

            list.appendChild(item);
        });
const dashboardList = document.getElementById("dashboardSubjectList");

if (dashboardList) {
    dashboardList.innerHTML = "";

    subjects.forEach(subject => {
        const item = document.createElement("li");
        item.textContent = subject.name;
        dashboardList.appendChild(item);
    });
}
        
// 1. Quiz dropdown: show database subjects + built-in quiz subjects
const quizDropdown = document.getElementById("quizSubject");

if (quizDropdown) {
    const previousValue = quizDropdown.value;

    quizDropdown.innerHTML =
        '<option value="">Select Subject</option>';

    const databaseSubjects = subjects.map(subject => subject.name);

    const builtInSubjects = builtInQuizQuestions.map(
        question => question.subject
    );

    const allSubjects = [
        ...new Set([...databaseSubjects, ...builtInSubjects])
    ];

    allSubjects.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        quizDropdown.appendChild(option);
    });

    if (allSubjects.includes(previousValue)) {
        quizDropdown.value = previousValue;
    }
}

// 2. Add-question dropdown: keep database subjects only
const questionDropdown =
    document.getElementById("quizQuestionSubject");

if (questionDropdown) {
    questionDropdown.innerHTML =
        '<option value="">Select Subject</option>';

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.name;
        option.textContent = subject.name;
        questionDropdown.appendChild(option);
    });
}
dropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);

    if (dropdown) {
        dropdown.innerHTML = '<option value="">Select Subject</option>';

        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.name;
            option.textContent = subject.name;
            dropdown.appendChild(option);
        });
    }
});

        

        updateSubjectCount();

    } catch (error) {

        console.error(error);

    }
}
async function loadTasks() {

    try {

        const userId = localStorage.getItem("userId");

const response = await fetch(
    `http://127.0.0.1:8080/api/tasks?userId=${userId}`
);
        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();

        const taskList =
            document.getElementById("taskList");

        taskList.innerHTML = "";

        tasks.forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className = "task";

            if (task.completed) {
                taskElement.classList.add("completed");
            }

            taskElement.dataset.id = task.id;

            taskElement.innerHTML = `
                <div>
                    <strong>${task.name}</strong>
                    <br>
                    <small>
                        Subject: ${task.subject}
                    </small>
                </div>

                <div>
                    <button onclick="completeTask(this)">
                        ${task.completed ? "↩️ Undo" : "✅ Complete"}
                    </button>

                    <button onclick="deleteTask(this)">
                        🗑️ Delete
                    </button>
                </div>
            `;

            taskList.appendChild(taskElement);

        });

        updateTaskCount();
        updateProgress();

    } catch (error) {

        console.error(error);

    }
}

async function loadQuizQuestions() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/quiz"
        );

        if (!response.ok) {
            throw new Error("Failed to load quiz questions");
        }

        const questions = await response.json();

        // Keep built-in questions and replace saved questions
        quizQuestions = quizQuestions.filter(
            question => !question.id
        );

        questions.forEach(item => {
            let answer;

            if (item.correctAnswer === "A") {
                answer = item.optionA;
            } else if (item.correctAnswer === "B") {
                answer = item.optionB;
            } else if (item.correctAnswer === "C") {
                answer = item.optionC;
            } else if (item.correctAnswer === "D") {
                answer = item.optionD;
            }

            quizQuestions.push({
                id: item.id,
                subject: item.subject,
                question: item.question,
                options: [
                    item.optionA,
                    item.optionB,
                    item.optionC,
                    item.optionD
                ],
                answer: answer
            });
        });

        displayQuizQuestions();

    } catch (error) {
        console.error("Error loading quiz questions:", error);
    }
}

async function deleteQuizQuestion(id) {
    if (!confirm("Are you sure you want to delete this question?")) {
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/quiz/" + id,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete quiz question");
        }

        // Remove the deleted question from the local list
        quizQuestions = quizQuestions.filter(
            question => String(question.id) !== String(id)
        );

        // Refresh the question list on the page
        displayQuizQuestions();

        // Remove it from the active quiz too
        activeQuizQuestions = activeQuizQuestions.filter(
            question => String(question.id) !== String(id)
        );

        alert("Quiz question deleted successfully!");

    } catch (error) {
        console.error("Error deleting quiz question:", error);
        alert("Could not delete the question. Please check the backend.");
    }
}


function displayQuizQuestions() {
    const quizList = document.getElementById("quizList");

    if (!quizList) return;

    quizList.innerHTML = "";

    quizQuestions.forEach((question, index) => {
        const item = document.createElement("div");
        item.className = "quiz-question-item";

        const subjectName = document.createElement("h4");
        subjectName.textContent = "📚 Subject: " + question.subject;

        const questionText = document.createElement("strong");
        questionText.textContent = (index + 1) + ". " + question.question;

        const options = document.createElement("p");
        options.textContent =
            "A) " + question.options[0] + "\n" +
            "B) " + question.options[1] + "\n" +
            "C) " + question.options[2] + "\n" +
            "D) " + question.options[3];

        options.style.whiteSpace = "pre-line";

        item.append(subjectName, questionText, options);

        // Only database questions have IDs and can be deleted from the database.
        if (question.id) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Delete";
            deleteButton.onclick = () =>
                deleteQuizQuestion(question.id);

            item.appendChild(deleteButton);
        }

        item.appendChild(document.createElement("hr"));
        quizList.appendChild(item);
    });
}

async function loadTimetable() {
    const userId = localStorage.getItem("userId");
    const timetableList = document.getElementById("timetableList");

    if (!userId || !timetableList) {
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/timetable?userId=${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const timetables = await response.json();
        timetableList.innerHTML = "";

        timetables.forEach(entry => {
            const row = document.createElement("tr");
            row.dataset.id = entry.id;

            row.innerHTML = `
                <td>${entry.day ?? ""}</td>
                <td>${entry.subject ?? ""}</td>
                <td>${entry.startTime ?? ""}</td>
                <td>${entry.endTime ?? ""}</td>
                <td>${entry.topic ?? ""}</td>
                <td>
                    <button onclick="deleteTimetable(this)">
                        🗑️ Delete
                    </button>
                </td>
            `;

            timetableList.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading timetable:", error);
    }
}

async function loadUnassignedTimetable() {
    const container = document.getElementById("unassignedTimetableList");

    if (!container) {
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/timetable/unassigned"
        );

        if (!response.ok) {
            throw new Error("Failed to load old timetable entries");
        }

        const entries = await response.json();
        container.innerHTML = "";

        if (entries.length === 0) {
            container.textContent = "No unassigned timetable entries found.";
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement("div");
            item.style.marginBottom = "10px";

            const details = document.createElement("span");
            details.textContent =
                `${entry.day} | ${entry.subject} | ` +
                `${entry.startTime}–${entry.endTime} | ${entry.topic} `;

            const button = document.createElement("button");
            button.textContent = "Recover to My Account";
            button.onclick = () => recoverTimetable(entry.id);

            item.appendChild(details);
            item.appendChild(button);
            container.appendChild(item);
        });

    } catch (error) {
        console.error("Recovery loading error:", error);
        container.textContent = "Could not load old entries.";
    }
}


function showQuizOption(sectionId) {
    const sections = [
        "addQuestionForm",
        "studentQuestionsSection",
        "takeQuizSection"
    ];

    sections.forEach(function(id) {
        document.getElementById(id).classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}


 // ========================================

let isRegisterMode = false;

const authSwitchButton = document.getElementById("authSwitchButton");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (authSwitchButton && loginForm && registerForm) {

    authSwitchButton.addEventListener("click", function () {
        isRegisterMode = !isRegisterMode;

        loginForm.classList.toggle("hidden", isRegisterMode);
        registerForm.classList.toggle("hidden", !isRegisterMode);

        document.getElementById("authTitle").textContent =
            isRegisterMode ? "📝 Student Registration" : "🔐 Student Login";

        document.getElementById("authSwitchText").textContent =
            isRegisterMode ? "Already registered?" : "New student?";

        this.textContent = isRegisterMode ? "Login" : "Create Account";
        document.getElementById("authMessage").textContent = "";
    });

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        try {
            const response = await fetch("http://127.0.0.1:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            document.getElementById("authMessage").textContent =
                result.message || (response.ok ? "Registration successful." : "Registration failed.");

            if (response.ok) {
                registerForm.reset();
                isRegisterMode = false;
                loginForm.classList.remove("hidden");
                registerForm.classList.add("hidden");
                document.getElementById("authTitle").textContent = "🔐 Student Login";
                document.getElementById("authSwitchText").textContent = "New student?";
                authSwitchButton.textContent = "Create Account";
            }
        } catch (error) {
            console.error("Registration error:", error);
            document.getElementById("authMessage").textContent =
                "Cannot connect to the backend. Make sure Spring Boot is running.";
        }
    });

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("http://127.0.0.1:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            document.getElementById("authMessage").textContent =
                result.message || (response.ok ? "Login successful." : "Login failed.");

            if (response.ok) {
    localStorage.setItem("userId", result.id);
    localStorage.setItem("userName", result.name);
    localStorage.setItem("userEmail", result.email);

    window.location.href = "dashboard.html";
}
        } catch (error) {
            console.error("Login error:", error);
            document.getElementById("authMessage").textContent =
                "Cannot connect to the backend. Make sure Spring Boot is running.";
        }
    });
}



function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    window.location.href = "index.html";
}

async function deleteTimetable(button) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        return;
    }

    const row = button.closest("tr");
    const timetableId = row?.dataset.id;

    if (!timetableId) {
        alert("Could not find this timetable entry.");
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/timetable/${timetableId}?userId=${encodeURIComponent(userId)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        await loadTimetable();
        alert("Timetable deleted successfully!");

    } catch (error) {
        console.error("Error deleting timetable:", error);
        alert("Could not delete timetable. Check the browser console.");
    }
}

async function recoverTimetable(timetableId) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        return;
    }

    if (!confirm("Recover this timetable entry into your current account?")) {
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/timetable/${timetableId}/recover?userId=${encodeURIComponent(userId)}`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        await loadTimetable();
        await loadUnassignedTimetable();

        alert("Timetable entry recovered successfully!");

    } catch (error) {
        console.error("Error recovering timetable:", error);
        alert("Could not recover the timetable entry. Check the browser console.");
    }
}
