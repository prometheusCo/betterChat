class LOC extends Error {

    constructor(message = "Missing context") {
        super(message);
        this.name = "Lack_of_context";
        this.code = "LOC";
        this.action = goDeeperInContext;

    }
}


class EPG extends Error {

    constructor(message = "Empty prompt given, prompt never must be empty") {
        super(message);
        this.name = "Empty_prompt";
        this.code = "EPG";
        this.action = false;
    }
}


class BAR extends Error {

    constructor(message = "Bad response from API Server") {
        super(message);
        this.name = "Bad_API_Response";
        this.code = "BAR";
        this.action = false;

    }
}

