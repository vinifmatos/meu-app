class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  def self.arel_query(name, params = {})
    ArelQueryLoader.arel(name, params)
  end

  def self.load_sql(name, params = {})
    ArelQueryLoader.load(name, params)
  end

  def self.arel_find_by_sql(name, params = {})
    find_by_sql(load_sql(name, params))
  end

  def self.exec_arel_query(name, params = {})
    connection.select_all(load_sql(name, params))
  end
end
