import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import {
  Button,
  Card as ReactStrapCard,
  CardBody,
  CardImg,
  CardText
} from "reactstrap";
import Card from "../Card";

let wrapper;
const updateUserCardsMock = jest.fn();
const cardMock = {
  name: "a card!",
  imageUrl: "someimage.com",
  set: { name: "I belong to this set" },
  text: "Here is what this card does"
};

beforeEach(() => {
  updateUserCardsMock.mockClear();

  wrapper = shallow(
    <Card
      card={cardMock}
      updateUserCards={updateUserCardsMock}
      imageUrl="image.com"
      name="name"
    />
  );
});

it("renders without crashing", () => {
  shallow(<Card card={cardMock} imageUrl="image.com" name="name" />);
});

it("has 1 <ReactStrapCard/>", () => {
  expect(wrapper.find(ReactStrapCard).exists()).toBeTruthy();
  expect(wrapper.find(ReactStrapCard).length).toBe(1);
});

it("has 1 <CardBody/>", () => {
  expect(wrapper.find(CardBody).exists()).toBeTruthy();
  expect(wrapper.find(CardBody).length).toBe(1);
});

it("has 1 <CardImg/>", () => {
  expect(wrapper.find(CardImg).exists()).toBeTruthy();
  expect(wrapper.find(CardImg).length).toBe(1);
});

it("has 2 <CardText/>", () => {
  wrapper.setProps({
    set: { name: "setName" }
  });

  expect(wrapper.find(CardText).exists()).toBeTruthy();
  expect(wrapper.find(CardText).length).toBe(2);
});

it("has Remove <Button/> if isUserCard is true", () => {
  wrapper.setProps({
    isUserCard: true
  });

  const btn = wrapper.find(Button);

  expect(btn.prop("children")).toMatch(/^Remove/i);
});

it("has Add <Button/> if isUserCard is false", () => {
  wrapper.setProps({
    isUserCard: false
  });

  const btn = wrapper.find(Button);

  expect(btn.prop("children")).toMatch(/^Add/i);
});

it("calls updateUserCards for addToUserCards", () => {
  wrapper.instance().addToUserCards();

  expect(updateUserCardsMock).toHaveBeenCalledTimes(1);
  expect(updateUserCardsMock).toHaveBeenCalledWith({
    card: cardMock
  });
});

it("calls updateUserCards for removeFromUserCards", () => {
  wrapper.instance().removeFromUserCards();

  expect(updateUserCardsMock).toHaveBeenCalledTimes(1);
  expect(updateUserCardsMock).toHaveBeenCalledWith({
    card: cardMock,
    remove: true
  });
});

it("matches snapshot", () => {
  const tree = renderer.create(
    <Card
      card={cardMock}
      name="name"
      artist="artist"
      originalType="originalType"
      setName="setName"
    />
  );

  expect(tree.toJSON()).toMatchSnapshot();
});
