let activities = JSON.parse(localStorage.getItem("activities")) || [];

const suggestionType = localStorage.getItem("suggestionType"); // "Indoor" / "Outdoor"

// get elements for CRUD process
const addButton = document.getElementById("addButton");
const nameInput = document.getElementById("activityName");
const typeInput = document.getElementById("activityType");
const activityList = document.getElementById("activityList");

// edit process
let editMode = false;
let activityEditingId = null; // to save activities that has been edited

function saveActivities() {
  localStorage.setItem("activities", JSON.stringify(activities));
}

function renderActivities() { // function to display activity lists
  activityList.innerHTML = "";
  // message will appear when no input
  if (activities.length === 0) {
    activityList.innerHTML = `<p>No activities yet. Add one above.</p>`;
    return;
  }

  activities.forEach(activity => {
    const row = document.createElement("div"); // create a container for an activity

    row.className = "activityItem";

    row.textContent = `${activity.name} (${activity.type})`;

    // edit process
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    // when user click edit, the selected acitivity will loaded into form
    editBtn.onclick = () => { 
      nameInput.value = activity.name;
      typeInput.value = activity.type;

      editMode = true;
      activityEditingId = activity.id;

      addButton.textContent = "Save"; // click save to update
      nameInput.focus();
    };

    // delete process
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      activities = activities.filter(a => a.id !== activity.id);
      saveActivities();
      renderActivities();

      // kalau tengah edit item yang sama, reset back
      if (editMode && activityEditingId === activity.id) {
        resetForm();
      }
    };

    // to put edit and delete button into row
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    // appendchild row to put it into activitylist to display to user
    activityList.appendChild(row); 
    showFeedback("Activity deleted");
  });
}

// to clear input
function resetForm() {
  editMode = false;
  activityEditingId = null;
  addButton.textContent = "Add";
  nameInput.value = "";
  typeInput.value = "Indoor"; 
}

// when click add and save button : 
addButton.addEventListener("click", () => {
  // get user input
  const name = nameInput.value.trim();
  const type = typeInput.value;

  if (name === "") return;

  // update mode
  if (editMode) { // user want to save back the activity that has been edited
    const target = activities.find(a => a.id === activityEditingId);
    if (!target) {
      resetForm();
      return;
    }

    // update old data to new
    target.name = name; 
    target.type = type; 

    // save
    saveActivities();
    renderActivities();
    resetForm();
    showFeedback("Activity updated");
    return;
  }

  // add activity process
  const newActivity = { // create new object
    id: Date.now(),
    name,
    type
  };

  activities.push(newActivity); // added into the list
  saveActivities();
  renderActivities();
  resetForm();
  showFeedback("Activity added successfully");
});

// to display message in the interface
const feedbackMsg = document.getElementById("feedbackMsg");
function showFeedback(msg){
  feedbackMsg.textContent = msg;

  setTimeout(function(){
    feedbackMsg.textContent = "";
  }, 2000); // set time, after 2 sec, it will disappear
}

// always display activities that existed in localstorage
renderActivities();