// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader} from "./views/base";
import * as searchView from "./views/searchView";

/**Global State of the app
 * - Search object
 * - Current recipe
 * - Shopping list object
 * - liked recipes
 */
const state = {}

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    //1. Get query from view
    const query = searchView.getInput();
    
    if(query) {
        //2. New Search Object and add to State
        state.search = new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
            
        //4. Search for recipes
        await state.search.getResults();

        //5. Render results on UI
        clearLoader();
        searchView.renderResults(state.search.recipes);
        } catch (error) {
            alert('Something went wrong with search');
            clearLoader();
        }
        
    }
    
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.recipes, goToPage);
    }
});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // 1. Get ID from url
    const id = window.location.hash.replace('#', '');

    if(id) {
        // 2. New Recipe Object and add to state
        state.recipe = new Recipe(id);

        try {
            
        //3. Get Recipe data
        await state.recipe.getRecipe();

        //4. Calculate Servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //5. Prepare UI Changes
        
        //6. Render Recipe 
        } catch (error) {
            alert(error);
        }


    }
    
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
