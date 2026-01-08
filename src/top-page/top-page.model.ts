export enum TopLevelCategory {
  Courses,
  Services,
  Books,
  Products,
}

export class TopPageModel {
  _id: string;
  firstCateogory: TopLevelCategory;
  secondCategory: string;
  title: string;
  hh?: {
    count: number;
    juniorSalary: number;
    middleSalary: number;
    seniorSalary: number;
  };
  advantages: {
    title: string;
    description: stirng;
  }[];
  seoText: string;
  tagsTitle: string;
  tags: string[];
}
