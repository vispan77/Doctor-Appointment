const computeAgeFromDob = (dob) => {
    if(!dob){
        return null;
    }

    const d = new Date(dob);

    const difference = Date.now() - d.getTime();

    const ageDate = new Date(difference);

    return Math.abs(ageDate.getUTCFullYear() - 1970)


}

module.exports = {computeAgeFromDob};
