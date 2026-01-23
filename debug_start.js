try {
    console.log("Attempting to require server/server.js...");
    require('./server/server.js');
} catch (e) {
    console.error("ERROR MESSAGE:", e.message);
    console.error("ERROR CODE:", e.code);
    console.error("STACK:", e.stack);
}
