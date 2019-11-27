import React from "react";
import { shallow } from "enzyme";
import { Spinner } from "reactstrap";

import { cardsEndpoint } from "../helpers/ApiEndpoints";
import MainNav from "../components/MainNav";
import Card from "../components/Card";
import Filters from "../components/Filters";
import App, { initialFilters } from "../App";

import { fetchApi, queryFormatHelper } from "../helpers/AjaxHelpers";
jest.mock("../helpers/AjaxHelpers");

jest.useFakeTimers();

let wrapper;
const mockCards = [
  {
    imageUrl: "theNorthWall.jpg",
    name: "Aegon Targaryen",
    set: { name: "King of the North" }
  },
  {
    imageUrl: "handOfQueen.svg",
    name: "Tyrion Lannister",
    set: { name: "Hand of the Queen" }
  },
  {
    imageUrl: "targaryenLyfe.jpg",
    name: "Jorah Mormont",
    set: { name: "Ser" }
  }
];
const success = {
  json: jest.fn().mockReturnValue({
    cards: mockCards,
    _links: {
      next: "http://google.com"
    },
    _totalCount: mockCards.length
  })
};

beforeEach(() => {
  fetchApi.mockImplementation(() => {
    return Promise.resolve(success);
  });

  wrapper = shallow(<App />);
});

beforeAll(() => {
  window.scroll = jest.fn();
  window.addEventListener = jest.fn();
});

it("renders without crashing", () => {
  shallow(<App />);
});

it("matches snapshot for initialFilters", () => {
  expect(initialFilters).toMatchSnapshot();
});

it("has 1 <MainNav/>", () => {
  expect(wrapper.find(MainNav).exists()).toBeTruthy();
  expect(wrapper.find(MainNav).length).toBe(1);
});

it("has 1 <Spinner/> if cards = 0 and isPageLoading = true", () => {
  wrapper.setState({
    cards: [],
    isPageLoading: true
  });

  expect(wrapper.find(Spinner).exists()).toBeTruthy();
  expect(wrapper.find(Spinner).length).toBe(1);
});

it('has a "No Data" message if card = 0 and isPageLoading = false', () => {
  wrapper.setState({
    cards: [],
    isPageLoading: false
  });

  expect(wrapper.find("p").text()).toMatch(/^No Data Found$/);
});

it(`has ${mockCards.length} <Card/>`, () => {
  expect(wrapper.find(Card).length).toBe(mockCards.length);
});

it("has 1 <Spinner/> if hasCards and isLoadingMore = true", () => {
  wrapper.setState({
    cards: [...mockCards],
    isLoadingMore: true
  });

  expect(wrapper.find(Spinner).exists()).toBeTruthy();
  expect(wrapper.find(Spinner).length).toBe(1);
});

it("has 1 <Filters/>", () => {
  expect(wrapper.find(Filters).exists()).toBeTruthy();
  expect(wrapper.find(Filters).length).toBe(1);
});

it("has correct starting state", () => {
  const app = new App();

  expect(app.state).toMatchSnapshot();
});

it("calls getCards and add listener on window for componentDidMount", async () => {
  window.addEventListener.mockClear();

  const instance = wrapper.instance();
  const spy = jest
    .spyOn(instance, "getCards")
    .mockImplementation(() => Promise.resolve());

  await instance.componentDidMount();

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith({ clearCards: true });

  expect(window.addEventListener).toHaveBeenCalled();
  expect(window.addEventListener).toHaveBeenCalledWith(
    "scroll",
    instance.handleScroll
  );
});

describe("handleScroll", () => {
  it("returns if isLoadingMore = true", () => {
    wrapper.setState({
      isLoadingMore: true,
      totalCount: 2000
    });

    const actual = wrapper.instance().handleScroll();
    expect(actual).toBeUndefined();
  });

  it("returns if hasAllCards = true", () => {
    wrapper.setState({
      isLoadingMore: false,
      totalCount: mockCards.length
    });

    const actual = wrapper.instance().handleScroll();
    expect(actual).toBeUndefined();
  });

  it.skip("does nothing if scroll position is not far enough", () => {
    const spy = jest.spyOn(wrapper.instance(), "getCards");

    wrapper.setState({
      isLoadingMore: false,
      totalCount: 2000
    });

    window.innerHeight = 300;
    window.scrollY = 100;
    document.style.height = "1001px";

    wrapper.instance().handleScroll();

    expect(spy).not.toHaveBeenCalled();
  });

  it("calls getCards if scroll position at correct position", () => {
    const spy = jest.spyOn(wrapper.instance(), "getCards");

    wrapper.setState({
      isLoadingMore: false,
      totalCount: 2000
    });
    window.innerHeight = 300;
    window.scrollY = 100;
    document.body.style.height = 1000;

    wrapper.instance().handleScroll();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("applyFilters", () => {
  it("works without args", () => {
    wrapper.setState({
      filters: {
        page: 10203727219383822,
        something: "here",
        nothing: "there"
      }
    });

    const currState = wrapper.state().filters;

    wrapper.instance().applyFilters();

    expect(wrapper.state().filters).toEqual({
      ...currState,
      page: 1
    });
  });

  it("sets correct state when delay = false", () => {
    const filters = { hereIsAFake: true, page: 5005 };
    wrapper.setState({
      filters
    });

    const filter = {
      filterHere: "here I am"
    };

    wrapper.instance().applyFilters({ filter });

    expect(wrapper.state().filters).toEqual({
      ...filters,
      ...filter,
      page: 1
    });
  });

  it("sets correct state when delay = true", () => {
    const filters = { hereIsAFake: true, page: 5005 };
    wrapper.setState({
      filters
    });

    const filter = {
      filterHere: "here I am"
    };

    wrapper.instance().applyFilters({ filter, delay: true });

    jest.runAllTimers();

    expect(wrapper.state().filters).toEqual({
      ...filters,
      ...filter,
      page: 1
    });
  });
});

it("resets filters and calls getCards on resetFilters", () => {
  wrapper.setState({
    filters: {
      1: true,
      3: false,
      mello: "yellow"
    }
  });

  const instance = wrapper.instance();
  const spy = jest.spyOn(instance, "getCards");

  instance.resetFilters();

  expect(wrapper.state().filters).toEqual(initialFilters);

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith({
    clearCards: true
  });
});

it("calls applyFilters for onChange", () => {
  const instance = wrapper.instance();
  const applyFiltersSpy = jest.spyOn(instance, "applyFilters");

  const event = {
    target: {
      id: "id",
      value: "value"
    }
  };

  instance.onChange(event);

  expect(applyFiltersSpy).toHaveBeenCalledTimes(1);
  expect(applyFiltersSpy).toHaveBeenCalledWith({
    filter: { id: "value" }
  });
});

it("calls applyFilters for onInput", () => {
  const instance = wrapper.instance();
  const applyFiltersSpy = jest.spyOn(instance, "applyFilters");

  const event = {
    target: {
      id: "id",
      value: "value"
    }
  };

  instance.onInput(event);

  expect(applyFiltersSpy).toHaveBeenCalledTimes(1);
  expect(applyFiltersSpy).toHaveBeenCalledWith({
    filter: { id: "value" },
    delay: true
  });
});

describe("getCards", () => {
  const paramsMock = "hereIsMyParams";

  beforeEach(() => {
    queryFormatHelper.mockReturnValue(paramsMock);
  });

  it("calls queryFormatHelper and fetchApi", () => {
    queryFormatHelper.mockClear();
    fetchApi.mockClear();
    wrapper.instance().getCards();

    const { filters } = wrapper.state();
    expect(queryFormatHelper).toHaveBeenCalledTimes(1);
    expect(queryFormatHelper).toHaveBeenCalledWith(filters);

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith(`${cardsEndpoint}${paramsMock}`);
  });

  it("sets correct state if no more pages available", async () => {
    const currentFilter = { filter1: true };
    const page = 2;
    const count = 30;
    wrapper.setState({
      totalCount: 2000,
      filters: {
        ...currentFilter,
        page
      }
    });

    fetchApi.mockImplementationOnce(() => {
      return Promise.resolve({
        json: jest.fn().mockReturnValue({
          cards: mockCards,
          _totalCount: count
        })
      });
    });

    await wrapper.instance().getCards();

    const { totalCount, filters } = wrapper.state();
    expect(totalCount).toEqual(parseInt(count));
    expect(filters).toEqual({
      ...currentFilter,
      page
    });
  });

  it("sets correct state if more pages available", async () => {
    const currentFilter = { filter1: true };
    const page = 2;
    const count = 30;
    wrapper.setState({
      totalCount: 2000,
      filters: {
        ...currentFilter,
        page
      }
    });

    fetchApi.mockImplementationOnce(() => {
      return Promise.resolve({
        json: jest.fn().mockReturnValue({
          cards: mockCards,
          _links: {
            next: "http://google.com"
          },
          _totalCount: count
        })
      });
    });

    await wrapper.instance().getCards();

    const { totalCount, filters } = wrapper.state();
    expect(totalCount).toEqual(count);
    expect(filters).toEqual({
      ...currentFilter,
      page: page + 1
    });
  });

  it("calls window.scroll if clearCards = true", async () => {
    window.scroll.mockClear();

    await wrapper.instance().getCards({ clearCards: true });

    expect(window.scroll).toHaveBeenCalledTimes(1);
    expect(window.scroll).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  });

  it("does not call window.scroll if clearCards = false", async () => {
    window.scroll.mockClear();

    await wrapper.instance().getCards({ clearCards: false });

    expect(window.scroll).not.toHaveBeenCalled();
  });

  it("sets correct cards state if clearCards = true", async () => {
    wrapper.setState({
      cards: [...mockCards]
    });
    const expected = [
      {
        artist: "Here is an artist",
        imageUrl: "image.png",
        name: "Some Name",
        originalType: "A type",
        setName: "Set Set Set"
      }
    ];

    fetchApi.mockImplementationOnce(() => {
      return Promise.resolve({
        ...success,
        json: jest.fn().mockReturnValue({
          cards: expected
        })
      });
    });
    await wrapper.instance().getCards({ clearCards: true });

    const { cards, isLoadingMore, isPageLoading } = wrapper.state();
    expect(cards).toEqual(expected);
    expect(isLoadingMore).toBeFalsy();
    expect(isPageLoading).toBeFalsy();
  });

  it("sets correct cards state if clearCards = false", async () => {
    wrapper.setState({
      cards: [...mockCards]
    });
    const expected = [
      {
        imageUrl: "image.png",
        name: "Some Name",
        set: { name: "Set Set Set" }
      }
    ];

    fetchApi.mockImplementationOnce(() => {
      return Promise.resolve({
        ...success,
        json: jest.fn().mockReturnValue({
          cards: expected,
          _links: { next: "next url" },
          _totalCount: mockCards.length + 1
        })
      });
    });
    await wrapper.instance().getCards({ clearCards: false });

    const { cards, isLoadingMore, isPageLoading } = wrapper.state();
    expect(cards).toEqual([...mockCards, ...expected]);
    expect(isLoadingMore).toBeFalsy();
    expect(isPageLoading).toBeFalsy();
  });

  it("catches error", async () => {
    const error = "Rejected!";
    fetchApi.mockImplementationOnce(() => Promise.reject(error));
    const consoleSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(args => args);

    await wrapper.instance().getCards();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("An error occurred", error);

    consoleSpy.mockRestore();
  });
});

describe("updateUserCards", () => {
  const byId = {
    1: { hello: "here" },
    2: { goodbye: "there" },
    3: { needSleep: "please?" }
  };
  const card = {
    id: 2020,
    someData: { hereItIs: true }
  };

  beforeEach(() => {
    wrapper.setState({
      userCards: {
        byId
      }
    });
  });

  it("removes correct userCard if remove = true", () => {
    wrapper.setState({
      userCards: {
        byId: {
          ...byId,
          1010: {
            ...card
          },
          [card.id]: {
            ...card
          }
        }
      }
    });

    wrapper.instance().updateUserCards({
      card,
      remove: true
    });

    expect(wrapper.state().userCards.byId).toEqual({
      ...byId,
      1010: {
        ...card
      }
    });
  });

  it("adds userCard", () => {
    const expected = {
      id: 12345,
      thisIsAMock: "maybe??"
    };

    wrapper.instance().updateUserCards({
      card: expected
    });

    expect(wrapper.state().userCards.byId).toEqual({
      ...byId,
      [expected.id]: {
        ...expected
      }
    });
  });
});
