/*
* Project name:         Pagination & Content Filter
* Student name:         Alex Khant (https://github.com/grashupfer99)
* Updated:              2018-05-23
*
* The project is implemented using the Module Pattern approach
* https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript
* pageUIController module contains DOM strings, template literals with functions that perform search, render pages and pagination
* globalController module controls the entire app, it gets data from the pageUIController module  
* Both are standalone modules, each part of the app works independently
*
*/

// Page Controller Module
const pageUIController = (function () {

    // Default number of entries per each page
    const entriesPerPage = 10;

    // DOM Strings
    const DOMStrings = {
        studentList: '.student-list',
        noResult: '.no-result',
        pageHeader: '.page-header',
        pagination: '.pagination',
        page: '.page',
        active: 'active',
    };

    // Template literals containing DOM elements 
    const DOMElements = {
        searchBar: `
            <div class="student-search">
                <input placeholder="Search for students...">
                <button>Search</button>
            </div>
        `,
        pagination: `
            <div class="pagination">
                <ul></ul>
            </div>
        `
    };

    // jQuery specific selectors
    const jQuerySelectors = {
        // selects all elements except the ones with 'display: none' 
        shown: '.student-item:not([style*="display: none"])'
    }

    // Public functions 
    return {

        // Search function
        studentSearch: function (student, searchQuery) {
            // Initiate search for each student 
            $(student).each(function () {
                // Show/hide results based on the input 
                $(this).text().toUpperCase().includes(searchQuery) ? $(this).show() : $(this).hide();
            });
            // Get a total number of all currently displayed entries
            let num = $(jQuerySelectors.shown).length;
            // Get the search results
            const searchRes = $(jQuerySelectors.shown);
            // Show the 'No results' message based on found results, or hide if none are found
            num > 0 ? $(DOMStrings.noResult).hide() : $(DOMStrings.noResult).show();
            // Return the search results 
            return searchRes;
        },

        // Rendering the page 
        renderPage: function (dataList, pageNum = 1) {
            // Hide all students on the page
            $(dataList).hide();
            /* Get start/end number for each student based on the passed page number
            start: if a passed argument is 1, then it's 0, else (passedArgument - 1) * entriesPerPage
            end: passed argument * entriesPerPage */
            const getStartpos = (pageNum) => pageNum === 1 ? 0 : (pageNum - 1) * entriesPerPage;
            const start = getStartpos(pageNum);
            const end = pageNum * entriesPerPage;
            // We copy students on the interval from start-end and display them on a given page
            $(dataList).slice(start, end).each(function () { $(this).fadeIn(50) });
        },

        // Display pagination
        appendPagination: function (dataList) {

            // Determine how many pages for this student list
            let totalPageNum = Math.ceil(dataList.length / entriesPerPage);

            // create a page link section, or do nothing if the sections already exists
            if ($(DOMStrings.pagination).length === 0) {
                $(DOMStrings.page).append(DOMElements.pagination);
            }

            // Update pagination links
            $('.pagination ul').children().remove();

            // If a total page number is not 1, create and append page links
            if (totalPageNum > 1) {
                // Repeat this action for every page
                for (let i = 0; i < totalPageNum; i++) {
                    const pageLink = `
                        <li>
                            <a href="#">${i + 1}</a>
                        </li>
                    `;
                    // Append a new page link
                    $('.pagination ul').append(pageLink);
                }
            }
            // By default, set the first page link to 'active'
            $('.pagination ul li').children().first().addClass(DOMStrings.active);
        },

        // Make the DOMStrings accessible from the main controller module
        getDOMStrings: function () { return DOMStrings },

        // Create and append the 'No results' message to the DOM if no matched students are found 
        appendNoResMsg: function () {
            $(DOMStrings.studentList).prepend(`
                <div class="no-result">
                    <span>No results</span>
                </div>
            `);
            $(DOMStrings.noResult).hide();
        },

        // Create and append the search bar to the DOM
        appendSearchBar: function () {
            $(DOMStrings.pageHeader).append(DOMElements.searchBar);
        }

    };

})();

// Main Controller Module 
const globalController = (function (pageUICtrl) {

    // Get the DOMStrings from pageUIController
    const DOM = pageUICtrl.getDOMStrings();
    // Get all students
    const $studentList = $(DOM.studentList).children();
    // Store temporary search results
    let $searchResList = $studentList;

    // Update search results, render the page and show pagination function combined / DRY 
    const renderCombined = (searchResOne, searchResTwo) => {
        searchResOne = searchResTwo;
        pageUICtrl.renderPage(searchResOne);
        pageUICtrl.appendPagination(searchResOne);
        return searchResOne;
    };

    // Function to store all event listeners
    const setupEventListeners = () => {
        // Handling search queries in real time as the user types
        $('.student-search input').on('keyup', function () {
            // Get the input, perform the search operations, render a new data on the page
            const $search = $(this).val();
            const searchRes = pageUICtrl.studentSearch($('.student-list li'), $search.toUpperCase());
            $searchResList = renderCombined($searchResList, searchRes);
        });

        // Search button event handler
        $(DOM.pageHeader).on('click', 'button', function (e) {
            // get the input value            
            let $searchClick = $('input').val();
            // if the input isn't an empty string
            if ($searchClick !== '') {
                // Clear the input field
                $searchClick = $('input').val('');
            } else {
                // If the input is empty, render the initial student list on the page with pagination
                pageUICtrl.renderPage($studentList);
                pageUICtrl.appendPagination($studentList);
                /* Set $searchResList back to default to view the initial student list 
                withouth the latest search queries in between the initial list */
                $searchResList = $studentList;
            }

        });

        // Page link event listener
        $('.pagination ul').on('click', 'a', function (e) {
            // Prevent default behavior for the a tag 
            e.preventDefault();
            // Get a page number
            const pgNum = parseInt($(e.target).text());
            // Render the page for the clicked link
            pageUICtrl.renderPage($searchResList, pgNum);
            // Mark that link as 'active' and remove 'active' from previously clicked link
            $(this).addClass(DOM.active);
            $(this).parent().siblings().children().removeClass(DOM.active);
        });

    };

    return {
        // Public init function 
        init: function () {
            // Create and append the 'No results' message
            pageUICtrl.appendNoResMsg();
            // Create and append the search bar
            pageUICtrl.appendSearchBar();
            // Display a default student list
            pageUICtrl.renderPage($studentList);
            // Display a pagination based on a total number of entries(students) 
            pageUICtrl.appendPagination($studentList);
            // Initialize all event listeners
            setupEventListeners();
        }
    };

})(pageUIController);

// Calling the init function, the app is launched!
globalController.init();
