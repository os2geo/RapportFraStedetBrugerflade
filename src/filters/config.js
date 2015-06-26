function (doc, req) {
    if (doc._deleted || (doc.type && doc.type === 'organization')) {
        return true;
    }
    return false;
    /*  
        if (doc._id.substring(0,7) === '_design') {
            return false;
        }
         return true;
    */
}