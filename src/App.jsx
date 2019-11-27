import React, { Fragment, PureComponent } from "react";

import { Spinner } from "reactstrap";

import { cardsEndpoint } from "./helpers/ApiEndpoints";
import { fetchApi, queryFormatHelper } from "./helpers/AjaxHelpers";
import MainNav from "./components/MainNav";
import Card from "./components/Card";
import Filters from "./components/Filters";

export const initialFilters = {
  orderBy: "name",
  page: 1,
  pageSize: 20,
  types: "creature"
};

class App extends PureComponent {
  state = {
    cards: [],
    userCards: {
      // order: [], // TODO: Look if ordering if good feature to have
      byId: {}
    },
    isLoadingMore: false,
    isPageLoading: true,
    totalCount: 0,
    filters: {
      ...initialFilters
    }
  };

  componentDidMount() {
    return this.getCards({ clearCards: true }).then(() => {
      window.addEventListener("scroll", this.handleScroll);
    });
  }

  handleScroll = () => {
    const { cards, isLoadingMore, totalCount } = this.state;
    const hasAllCards = totalCount === cards.length;

    if (isLoadingMore || hasAllCards) {
      return;
    }

    const { innerHeight, scrollY } = window;

    if (innerHeight + scrollY >= document.body.offsetHeight - 600) {
      this.getCards();
    }
  };

  applyFilters = ({ filter, delay = false } = {}) => {
    this.setState(
      prevState => ({
        filters: {
          ...prevState.filters,
          ...filter,
          page: 1
        }
      }),
      () => {
        if (delay) {
          clearTimeout(this.timer);

          this.timer = setTimeout(() => {
            this.getCards({ clearCards: true });
          }, 500);

          return;
        }

        this.getCards({ clearCards: true });
      }
    );
  };

  resetFilters = () => {
    this.setState(
      {
        filters: { ...initialFilters }
      },
      () => {
        this.getCards({ clearCards: true });
      }
    );
  };

  onChange = ({ target: { id, value } }) => {
    const filter = { [id]: value };
    return this.applyFilters({ filter });
  };

  onInput = ({ target: { id, value } }) => {
    const filter = { [id]: value };
    this.applyFilters({ filter, delay: true });
  };

  getCards = ({ clearCards = false, query = this.state.filters } = {}) => {
    const queryParams = queryFormatHelper(query);

    this.setState({ isLoadingMore: true, isPageLoading: clearCards });

    return fetchApi(`${cardsEndpoint}${queryParams}`)
      .then(async res => {
        if (clearCards) {
          window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth"
          });
        }

        const json = await res.json();

        const hasPages = json._links && json._links.next;

        this.setState(() => {
          const { page, ...filters } = this.state.filters;
          const cards = clearCards
            ? json.cards
            : [...this.state.cards, ...json.cards];

          return {
            cards,
            filters: {
              ...filters,
              page: hasPages ? page + 1 : page
            },
            isLoadingMore: false,
            isPageLoading: false,
            totalCount: json._totalCount
          };
        });
      })
      .catch(err => console.warn("An error occurred", err)); // TODO: Catch error, show toast
  };

  updateUserCards = ({ card, remove }) => {
    const { userCards } = this.state;
    const { id } = card;
    const byId = {
      ...userCards.byId,
      [id]: card
    };

    if (remove) {
      delete byId[id];
    }

    this.setState({
      userCards: {
        ...userCards,
        byId
      }
    });
  };

  render() {
    const {
      cards,
      userCards,
      isLoadingMore,
      isPageLoading,
      filters,
      totalCount
    } = this.state;
    const hasCards = cards && cards.length > 0;

    return (
      <div>
        <MainNav
          applyFilters={this.applyFilters}
          getCards={this.getCards}
          totalCount={totalCount}
          userCards={userCards}
        />

        <div className="container">
          {hasCards ? (
            <Fragment>
              <div className="row">
                {cards.map((card, index) => {
                  const { id } = card;

                  const isUserCard = userCards.byId[id] !== undefined;

                  return (
                    <Card
                      card={card}
                      isUserCard={isUserCard}
                      key={`${id}-${index}`}
                      updateUserCards={this.updateUserCards}
                    />
                  );
                })}
              </div>

              {isLoadingMore && (
                <div className="row">
                  <div className="col d-flex justify-content-center align-items-center mb-5">
                    <Spinner color="secondary" />
                  </div>
                </div>
              )}
            </Fragment>
          ) : (
            <div className="row">
              <div className="col d-flex justify-content-center align-items-center vh-100 mt-n5">
                {isPageLoading ? (
                  <Spinner color="secondary" />
                ) : (
                  <p className="m-0">No Data Found</p>
                )}
              </div>
            </div>
          )}

          <Filters
            disabled={isPageLoading || isLoadingMore}
            filters={filters}
            onChange={this.onChange}
            onInput={this.onInput}
            resetFilters={this.resetFilters}
            totalCount={totalCount}
          />
        </div>
      </div>
    );
  }
}

export default App;
