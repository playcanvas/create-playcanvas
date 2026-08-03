// Validate a string as a npm package name
export const isValidPackageName = (projectName: string) => {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
};

// Convert arbitrary string into a valid npm package name
export const toValidPackageName = (projectName: string) => {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-');
};
