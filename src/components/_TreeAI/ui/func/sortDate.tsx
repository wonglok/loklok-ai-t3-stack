export const sortDate = (a: any, b: any) => {
    let dateA = new Date(a.createdAt).getTime();
    let dateB = new Date(b.createdAt).getTime();

    if (dateA > dateB) {
        return 1;
    } else if (dateA < dateB) {
        return -1;
    } else {
        return 0;
    }
};
