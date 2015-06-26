function (doc) {
    if (doc.type && doc.type === 'organization' && !doc.hidden) {
        emit(doc.name, null);
    }
}