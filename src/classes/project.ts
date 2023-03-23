class Project {
    public projectHook: string
    public projectName: string
    public textPath: string
    
    constructor(projectHook: string, projectName: string, textPath: string) {
        this.projectHook = projectHook;
        this.projectName = projectName;
        this.textPath = textPath
    }
}

export default Project