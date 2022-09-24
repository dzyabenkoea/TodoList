import './index.css'
import {v4 as uuidv4} from 'uuid'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './projects.css'
import './tasks.css'

const ProjectManager = (function () {

    let currentProject = null
    let projects = []

    const Renderer = (function () {

        function renderProjects() {
            const projWindow = document.querySelector('#project-list')
            projWindow.innerHTML = projectsHTML()
        }

        function projectsHTML() {
            let html = ''
            let activeProject = ' active'
            projects.forEach(project => {
                html += `
                <li class="project-list-element${project.id === currentProject.id ? activeProject : ''}" data-project-id=${project.id}>
                    <p class="project-text">${project.name}</p>
                    <button type="button" class="remove-button">
                    <i class="remove-icon bi bi-trash-fill"></i>
                    </button>
                </li>`
            })
            return html
        }

        function renderTasks() {
            // Обновить название открытого проекта
            document.querySelector('#current-project-name').textContent = currentProject.name

            // Обновить список задач
            const taskContainer = document.querySelector('#task-list')
            taskContainer.innerHTML = tasksHTML(currentProject.tasks)
        }

        function tasksHTML(tasks) {
            let html = ``
            tasks.forEach(task => {
                html += `
                <div class="task" data-task-id="${task.id}">
                    <div class="task-content">
                        <input type="checkbox"${task.isFinished ? " checked" : ""}>
                        <p class="task-text">${task.title}</p>
                    </div>
                    <button class="remove-task-button">
                    <i class="bi bi-x-lg"></i>
                    </button>
                </div>`
            })
            return html
        }

        function showNewProjectWindow(addClickedHandler) {

            const existingDiv = document.querySelector('#new-project-window')
            if (existingDiv) return;

            const div = document.createElement('div')
            div.id = 'new-project-window'
            div.innerHTML = `
            <input type="text" placeholder="Название проекта" id="new-project-name">
            <div>
                <button id="new-project-add-button" type="button">
                    <i class="bi bi-check"></i>
                </button>
                <button id="new-project-cancel-button" type="button">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            `

            function addProjectHandler(event) {
                const projectName = div.querySelector('#new-project-name')
                addClickedHandler(projectName.value)
                div.remove()
            }

            function cancelHandler(event) {
                div.remove()
            }

            div.querySelector("#new-project-add-button").addEventListener('click', addProjectHandler.bind(this))
            div.querySelector("#new-project-cancel-button").addEventListener('click', cancelHandler.bind(this))

            const projectList = document.querySelector('#project-list')
            projectList.append(div)
            div.querySelector('input').focus()
        }

        function showProjectList(show = true) {
            const window = document.querySelector('#project-window')
            if (show)
                window.classList.add('show')
            else
                window.classList.remove('show')
        }

        const tests = function () {
            const _tests = [function test_render() {
                projects = []
                const project = addProject('adfasdfasdf', 'adfasdfasdf')
                console.assert(projects.length === document.querySelectorAll('[data-project-id]').length)
                removeProject(project.id)
            }]
            return {
                run: () => {
                    _tests.forEach(test => test())
                }
            }
        }()

        return {renderProjects, renderTasks, showNewProjectWindow, showProjectList, tests}
    })()

    function projectsCount() {
        return projects.length
    }

    function getProject(id) {
        let project = projects.find(el => el.id === id)
        if (project === undefined)
            project = null
        return project
    }

    function addProject(name, id = uuidv4()) {
        const project = {id, name, isFinished: false, tasks: []}
        projects.push(project)
        currentProject = project
        Renderer.renderProjects()
        Renderer.renderTasks()
        return project
    }

    function removeProject(id) {
        projects = projects.filter(el => el.id !== id)
        if (projects.length === 0)
            addProject('Пустой проект')
        else
            currentProject = projects[projects.length - 1]
        Renderer.renderProjects()
        Renderer.renderTasks()
    }

    function setActiveProject(id) {
        currentProject = getProject(id)
        Renderer.renderProjects()
        Renderer.renderTasks()
    }

    const tests = (function () {
        const _tests = [
            function test_addProject() {
                projects = []
                const oldLength = projectsCount()
                addProject('Проект для добавления', '123')
                console.assert(projectsCount() === oldLength + 1)
                removeProject('123')
            },
            function test_removeProject() {
                projects = []
                addProject('123', 'Проект для удаления')
                removeProject('123')
                console.assert(getProject('123') === null)
            },
            function test_getProject() {
                projects = []
                addProject('Noname', '123')
                const project = getProject('123')
                console.assert(project !== null)
                removeProject('123')
            },
            function test_renderAddedProject() {
                projects = []
                addProject('Наименование', '123')
            },
            function test_setActiveProject() {
                projects = []
                addProject('Проект 111')
                const project = addProject('Проект 222')
                addProject('Проект 3333')
                setActiveProject(project.id)
                console.assert(currentProject.id === project.id)
            }
        ]

        function run() {
            Renderer.tests.run()
            _tests.forEach(test => {
                test()
            })
        }

        return {run}
    })()

    const TaskManager = (function () {

        function addTask(projectId, title, dueDate, id = uuidv4()) {
            const task = {id, title, dueDate, isFinished: false}
            getProject(projectId).tasks.push(task)
            Renderer.renderTasks()
            return task
        }

        function removeTask(projectId, taskId) {
            const project = getProject(projectId)
            project.tasks = project.tasks.filter(task => task.id !== taskId)
            Renderer.renderTasks()
        }

        function getTask(projectId, taskId) {
            const project = getProject(projectId)
            const task = project.tasks.find(task => task.id === taskId)
            return task || null
        }

        function markAsFinished(projectId, taskId, isFinished = true) {
            const task = getTask(projectId, taskId)
            task.isFinished = isFinished
            Renderer.renderTasks()
        }

        const tests = {
            run: function () {
                const _tests = [
                    function test_addTask() {
                        projects = []
                        const project = addProject('Проект 1')
                        const task = addTask(project.id, '123', 'Новая задача')
                        console.assert(getProject(project.id).tasks.find(el => el.id === task.id))
                        removeProject(project.id)
                    },
                    function test_removeTask() {
                        projects = []
                        const project = addProject('Проект 1')
                        const task = addTask(project.id, '123', 'Новая задача')
                        console.assert(getProject(project.id).tasks.find(el => el.id === task.id))
                        removeProject(project.id)
                        console.assert(getProject(project.id) === null)
                    },
                    function test_markAsFinished() {
                        projects = []
                        const project = addProject('на удаление')
                        const task = addTask(project.id, 'тестовая задача')
                        markAsFinished(project.id, task.id)
                        console.assert(getTask(project.id, task.id).isFinished)
                    }
                ]
                _tests.forEach(test => test())
            }
        }

        return {addTask, removeTask, getTask, markAsFinished, tests}
    })()

    const EventMapper = (function () {

        function mapAddProject() {
            const button = document.querySelector('#add-project-button')
            button.addEventListener('click', event => {
                Renderer.showNewProjectWindow((newProjectName) => {
                    ProjectManager.addProject(newProjectName)
                })
            })
        }

        function mapRemoveProject() {
            const projectList = document.querySelector('#project-list')
            projectList.addEventListener('click', event => {
                const button = event.target.closest('.remove-button')
                if (button !== null) {
                    const task = button.closest('.project-list-element')
                    ProjectManager.removeProject(task.dataset.projectId)
                }
            })
        }

        function mapTaskListAction() {
            const taskList = document.querySelector('#task-list')
            taskList.addEventListener('click', (event) => {
                const target = event.target
                if (target.closest('.remove-task-button')) {
                    const removeButton = target.closest('.remove-task-button')
                    const task = removeButton.closest('.task')
                    TaskManager.removeTask(currentProject.id, task.dataset.taskId)
                    event.cancelBubble = true
                } else if (target.type === 'checkbox') {
                    event.cancelBubble = true
                    const task = target.closest('.task')
                    TaskManager.markAsFinished(currentProject.id, task.dataset.taskId, target.checked)
                }
            })
        }

        function mapAddTask() {
            const input = document.querySelector('#new-task-input')

            function handleTaskAdd() {
                TaskManager.addTask(currentProject.id, input.value)
                input.value = ''
            }

            input.addEventListener('keyup', event => {
                if (event.key === 'Enter') {
                    handleTaskAdd()
                }
            })

            const button = document.querySelector('#new-task-add-button')
            button.addEventListener('click', event => {
                handleTaskAdd()
            })
        }

        function mapProjectListAction() {
            const projectList = document.querySelector('#project-list')
            projectList.addEventListener('click', event => {
                const target = event.target
                if (target.closest('.remove-button')) {
                    event.cancelBubble = true
                    const removeButton = target.closest('.remove-button')
                    const projectListElement = removeButton.closest('.project-list-element')
                    ProjectManager.removeProject(projectListElement.dataset.id)
                } else if (target.closest('.project-list-element')) {
                    event.cancelBubble = true
                    const projectListElement = target.closest('.project-list-element')
                    ProjectManager.setActiveProject(projectListElement.dataset.projectId)
                }
            })
        }

        function mapProjectListMenuClick() {
            document.querySelector('#projects-menu button').addEventListener('click', (event) => {
                Renderer.showProjectList()
            })
        }

        function mapProjectListReturn() {
            document.querySelector('#project-window-close-button').addEventListener('click', (event) => {
                Renderer.showProjectList(false)
            })
        }

        mapRemoveProject()
        mapAddProject()
        mapAddTask()
        mapProjectListAction()
        mapTaskListAction()
        mapProjectListMenuClick()
        mapProjectListReturn()

        const tests = {
            run: function () {
                const _tests = [
                    function test_clickSetActiveProject() {
                        projects = []
                        const testProjects = [
                            addProject('Тестовый проект'),
                            addProject('Тестовый проект'),
                            addProject('Тестовый проект')
                        ]
                        const targetProject = testProjects[1]
                        const projectElement = document.querySelectorAll(`.project-list-element[data-project-id="${targetProject.id}"]`)[0]
                        projectElement.click()
                        console.assert(currentProject.id === targetProject.id, 'Clicked project and current project do not match')
                        testProjects.forEach(project => removeProject(project.id))
                    },
                    function test_clickRemoveProject() {
                        projects = []
                        const project = addProject('Проект1')
                        addProject('Проект1')
                        addProject('Проект1')

                        const projectElement = document.querySelector(`[data-project-id="${project.id}"]`)
                        const button = projectElement.querySelector('.remove-button')
                        button.click()

                        console.assert(getProject(project.id) === null, 'Project was removed but is still present')
                    },
                    function test_removeTaskClick() {
                        projects = []
                        const project = addProject('Пустое')
                        const task = TaskManager.addTask(project.id, 'Пустая')
                        const taskRemoveButton = document.querySelector(`[data-task-id="${task.id}"] .remove-task-button`)
                        taskRemoveButton.click()
                        const taskFound = TaskManager.getTask(project.id, task.id)
                        console.assert(taskFound === null, 'Task was clicked to be removed but still exists')
                        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`)
                        console.assert(taskElement === null, 'Task was deleted but still present on the page')
                    },
                    function test_markFinishedClick() {
                        const project = addProject('temp')
                        const task = TaskManager.addTask(project.id, 'temp-name')
                        const checkBoxElement = document.querySelector(`.task[data-task-id="${task.id}"] input[type="checkbox"]`)

                        checkBoxElement.click()
                        console.assert(TaskManager.getTask(project.id, task.id).isFinished, 'Task is not finished despite being clicked')

                        checkBoxElement.click()
                        console.assert(TaskManager.getTask(project.id, task.id).isFinished === false, 'Task was clicked to be unfinished but is still finished')

                    }
                ]
                _tests.forEach(test => test())
            }
        }

        return {tests}

    })()

    function freshStart() {
        projects = []
        // Проект по умолчанию, если других проектов нет
        addProject('Пустой проект')
    }

    return {
        addProject,
        removeProject,
        setActiveProject,
        freshStart,
        tests: {
            run() {
                tests.run()
                TaskManager.tests.run()
                EventMapper.tests.run()
                EventMapper.tests.run()
                freshStart()
            }
        },
    }

})()

ProjectManager.tests.run()
ProjectManager.freshStart()
