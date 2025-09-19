const Api = (() => {
    const url = 'http://localhost:4232/courseList'
    const courseListPromise = fetch(url).then((res) => {
        return res.json()
    })

    return {
        courseListPromise,
    }
})()

const View = (() => {
    const dom = {
        selectContainer: document.querySelector('#course_list')
    }

    const createListTemplate = (dataList) => {
        let template = ''

        dataList.forEach((course) => {
            template += `<li>${
                course.courseName
            }</li>`
        })
        return template
    }

    const render = (elem, template) => {
        elem.innerHTML = template
    }

    return {
        dom,
        createListTemplate,
        render
    }
})()

const Model = ((view, api) => {
    const { dom, createListTemplate, render } = view
    const { courseListPromise } = api

    class Courses {
        #courseList
        constructor() {
            this.#courseList = []
        }
        set newList(newCourses) {
            this.#courseList = newCourses
            const template = createListTemplate(newCourses)
            render(dom.selectContainer, template)
        }
        get getCourses() {
            return this.#courseList
        }
    }

    return {
        Courses,
        courseListPromise
    }
})(View, Api)

const Controller = ((model, view) => {
    const { Courses, courseListPromise } = model
    const { dom } = view
    const courseList = new Courses()

    const init = () => {
        courseListPromise.then((list) => {
            courseList.newList = list
        })
    }

    const bootstrap = () => {
        init()
    }

    return {
        bootstrap,
    }
})(Model, View)

Controller.bootstrap()