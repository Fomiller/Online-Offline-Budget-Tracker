let db;
// create a new db request for a "budget" database.
const request = indexedDB.open('budget-HW');

request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  db = event.target.result
  db.createObjectStore('pending', { autoIncrement: true });

};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  // log error here
  console.log('ON ERROR', event.target.error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const tx = db.transaction('pending', 'readwrite');
  const pendingStore = tx.objectStore('pending');
  pendingStore.add(record);

}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const tx = db.transaction('pending');
  const pendingStore = tx.objectStore('pending');
  const getAll = pendingStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const tx = db.transaction('pending', 'readwrite');
          const pendingStore = tx.objectStore('pending');
          pendingStore.clear();

      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);