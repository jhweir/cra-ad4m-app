import { SDNAClass, SubjectEntity, SubjectProperty } from "@coasys/ad4m";

@SDNAClass({ name: "Todo" })
class Todo extends SubjectEntity {
  @SubjectProperty({
    through: "todo://state",
    initial: "todo://ready",
    writable: true,
    required: true,
  })
  state: string = "";

  @SubjectProperty({
    through: "todo://has_title",
    writable: true,
    resolveLanguage: "literal",
  })
  title: string = "";
}
