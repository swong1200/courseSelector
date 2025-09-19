const Api = (() => {
  const url = 'http://localhost:4232/courseList';
  const courseListPromise = fetch(url).then((res) => {
    return res.json();
  });

  return {
    courseListPromise,
  };
})();

const View = (() => {
  const dom = {
    selectContainer: document.querySelector('#course_list'),
    chosenContainer: document.querySelector('#selected_course_list'),
    creditCounter: document.querySelector('#credit_counter'),
    selectBtn: document.querySelector('#select_button'),
    get availableCourses() {
      return document.querySelectorAll('.course');
    },
  };

  const createListTemplate = (dataList) => {
    let template = '';

    dataList.forEach((course) => {
      template += `<li id="course${course.courseId}" class="course">
            ${course.courseName}<br>
            Course Type: ${course.required ? 'Compulsory' : 'Elective'}<br>
            Course Credit: ${course.credit}
            </li>`;
    });
    return template;
  };

  const createCreditCounter = (credits) => {
    let template = `${credits}`;
    return template;
  };

  const render = (elem, template) => {
    elem.innerHTML = template;
  };

  return {
    dom,
    createListTemplate,
    createCreditCounter,
    render,
  };
})();

const Model = ((view, api) => {
  const { dom, createListTemplate, render } = view;
  const { courseListPromise } = api;

  class Courses {
    #courseList;
    constructor() {
      this.#courseList = [];
    }
    set newList(newCourses) {
      this.#courseList = newCourses;
      const template = createListTemplate(newCourses);
      render(dom.selectContainer, template);
    }
    get getCourses() {
      return this.#courseList;
    }
  }

  return {
    Courses,
    courseListPromise,
  };
})(View, Api);

const Controller = ((model, view) => {
  const { Courses, courseListPromise } = model;
  const { dom, createCreditCounter, createListTemplate, render } = view;
  const courseList = new Courses();
  const selectedCourses = new Set();
  let totalCredits = 0;

  function updateCredits(id) {
    const courseId = Number(id[id.length - 1]);

    const curCourse = courseList.getCourses.filter(
      (course) => course.courseId === courseId
    );

    if (selectedCourses.has(id)) {
      totalCredits += curCourse[0].credit;
    } else {
      totalCredits -= curCourse[0].credit;
    }
    if (totalCredits <= 18) {
      dom.creditCounter.textContent = totalCredits;
    }
  }

  function toggleCourse() {
    dom.availableCourses.forEach((li) => {
      li.addEventListener('click', () => {
        // toggle course in global state
        if (selectedCourses.has(li.id)) {
          selectedCourses.delete(li.id);
          //   update color
          li.classList.remove('active');
        } else {
          const courseId = Number(li.id[li.id.length - 1]);

          const curCourse = courseList.getCourses.filter(
            (course) => course.courseId === courseId
          );

          if (totalCredits + curCourse[0].credit > 18) {
            alert('You can only choose up to 18 credits in one semester');
            return;
          }
          selectedCourses.add(li.id);
          //   update color
          li.classList.add('active');
        }

        // update count
        updateCredits(li.id);
      });
    });
  }

  function handleSelectButton() {
    dom.selectBtn.addEventListener('click', () => {
      if (totalCredits === 0) {
        alert("You haven't selected any courses yet!");
        return;
      }

      const confirmMsg = `You have chosen ${totalCredits} credits for this semester. You cannot change once you submit. Do you want to confirm?`;

      if (confirm(confirmMsg)) {
        const renderList = [];
        selectedCourses.forEach((id) => {
          const courseId = Number(id[id.length - 1]);
          const curCourse = courseList.getCourses.filter(
            (course) => course.courseId === courseId
          );
          renderList.push(curCourse[0]);
        });

        const template = createListTemplate(renderList);
        render(dom.chosenContainer, template);

        // update DOM
        dom.availableCourses.forEach((li) => {
          li.classList.remove('active');
        });
        // disable button
        dom.selectBtn.disabled = true;
      }
    });
  }

  function init() {
    courseListPromise.then((list) => {
      courseList.newList = list;
      toggleCourse();
      dom.creditCounter.textContent = totalCredits;
      handleSelectButton();
    });
  }

  function bootstrap() {
    init();
  }

  return {
    bootstrap,
    toggleCourse,
    handleSelectButton,
  };
})(Model, View);

Controller.bootstrap();
