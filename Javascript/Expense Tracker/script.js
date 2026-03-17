let expensearr = JSON.parse(localStorage.getItem("expenses")) || [
    { Date: '2024-12-31', Amount: 1000, Category: 'Travel', Type: 'Expense', Reference: "IRCTC" },
    { Date: '2024-12-31', Amount: 300, Category: 'Food', Type: 'Expense', Reference: "Swiggy" }
];

let chart;
let isChartVisible = false;

// INIT
document.getElementById('chartSection').style.display = "none";

// ADD
document.getElementById('addnew').onclick = (e) => {
    e.preventDefault();
    document.querySelector('.add-expense').style.display = 'block';
    document.querySelector('.display-events').style.display = 'none';
};

// SUBMIT
document.querySelector('.form').addEventListener('submit', function(e) {
    e.preventDefault();

    let btn = document.getElementById('submit-btn');
    let mode = btn.dataset.mode;

    let data = {
        Date: date.value,
        Amount: amount.value,
        Category: category.value,
        Type: type.value,
        Reference: reference.value
    };

    if (mode === "edit") {
        expensearr[btn.dataset.index] = data;
        btn.dataset.mode = "";
    } else {
        expensearr.push(data);
    }

    this.reset();

    document.querySelector('.add-expense').style.display = 'none';
    document.querySelector('.display-events').style.display = 'block';

    renderTable();
});
// RENDER
function renderTable() {
    let tbody = document.getElementById('t-body');
    tbody.innerHTML = "";

    let total = 0;

    expensearr.forEach((e, i) => {
        total += Number(e.Amount);

        tbody.innerHTML += `
        <tr>
            <td>${i+1}</td>
            <td>${e.Date}</td>
            <td>${e.Amount}</td>
            <td>${e.Category}</td>
            <td>${e.Type}</td>
            <td>${e.Reference}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="edit(${i})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="del(${i})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById('totalamt').innerText = "Rs: " + total;

    localStorage.setItem("expenses", JSON.stringify(expensearr));

    if (isChartVisible) drawChart();
}

//EDIT
function edit(i) {
    let e = expensearr[i];

    // Fill form with existing data
    document.getElementById('date').value = e.Date;
    document.getElementById('amount').value = e.Amount;
    document.getElementById('category').value = e.Category;
    document.getElementById('type').value = e.Type;
    document.getElementById('reference').value = e.Reference;

    // Set edit mode
    let btn = document.getElementById('submit-btn');
    btn.dataset.mode = "edit";
    btn.dataset.index = i;

    // Show form
    document.querySelector('.add-expense').style.display = 'block';
    document.querySelector('.display-events').style.display = 'none';
}

// DELETE
function del(i) {
    expensearr.splice(i, 1);
    renderTable();
}

// SEARCH
function search() {
    let val = sch.value.toLowerCase();
    document.querySelectorAll("#t-body tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}

// CATEGORY FILTER
function filterCategory(type) {
    let total = 0;

    document.querySelectorAll("#t-body tr").forEach(row => {
        row.style.display = "";

        let cat = row.children[3].textContent;

        if (type !== "All" && cat !== type) {
            row.style.display = "none";
        } else {
            total += Number(row.children[2].textContent);
        }
    });

    document.getElementById('category-type').innerText = type + " Total";
    document.getElementById('category-type-amt').innerText = "Rs: " + total;
}

// DATE FILTER
function dayfilter(range) {
    let days = {
        "Last Week": 7,
        "Last One Month": 30,
        "Last six Months": 180,
        "Last Year": 365
    };

    let today = new Date();
    let total = 0;

    document.querySelectorAll("#t-body tr").forEach(row => {
        row.style.display = "";

        let date = new Date(row.children[1].textContent);
        let diff = (today - date) / (1000 * 60 * 60 * 24);

        if (diff > days[range]) {
            row.style.display = "none";
        } else {
            total += Number(row.children[2].textContent);
        }
    });

    document.getElementById('periods').innerText = range;
    document.getElementById('periodamt').innerText = "Rs: " + total;
}

// CHART TOGGLE
function showChart() {
    let section = document.getElementById('chartSection');
    let btn = document.getElementById('chartBtn');

    if (!isChartVisible) {
        section.style.display = "block";
        btn.innerText = "Hide Chart";
        drawChart();
        isChartVisible = true;
    } else {
        section.style.display = "none";
        btn.innerText = "Show Chart";
        isChartVisible = false;
    }
}

// DRAW CHART
function drawChart() {
    let totals = {};

    expensearr.forEach(e => {
        totals[e.Category] = (totals[e.Category] || 0) + Number(e.Amount);
    });

    let ctx = document.getElementById('expenseChart');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: Object.keys(totals),
        datasets: [{
            data: Object.values(totals)
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}

renderTable();