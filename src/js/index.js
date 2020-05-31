// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader} from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

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
            
        //3. Get Recipe data and parse Ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        //4. Calculate Servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //5. Prepare UI Changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if(state.search) searchView.highlightSelected(id);
        //6. Render Recipe 
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            alert(error);
        }


    }
    
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST Controller
 */
const controlList = () => {
    //Create a new list if there is none yet 
    if(!state.list) state.list = new List();
    
    //Add each ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
} 

/**
 * LIKE Controller
 */
const controllerLike = () => {
    //Create a new list if there is none yet 
    if(!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;

    if(!state.likes.isLiked(currentId)) {
        const newLike = state.likes.addLikes(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
    } else {
        state.likes.deleteLikes(currentId);

        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from State
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);
    } else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1)
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        controllerLike();
    }
});

//handling likes button clicks
elements.recipe.addEventListener('click', e => {

});

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(likesView));
});