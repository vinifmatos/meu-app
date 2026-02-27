module Version
  def major
    1
  end

  def minor
    0
  end

  def patch
    0
  end

  def to_s
    "#{major}.#{minor}.#{patch}"
  end

  def api_version
    "v#{major}"
  end

  module_function :major, :minor, :patch, :to_s, :api_version
end
